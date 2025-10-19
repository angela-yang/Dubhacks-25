import os
import numpy as np
from PIL import Image
import glob
import re
import json
import google.generativeai as genai
from transformers import CLIPProcessor, CLIPModel
import io
import torch
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

GOOGLE_API_KEY = "AIzaSyBSWxfdbU5OGb3jApuw0W27n1ZMtFh3X6o"

app = FastAPI()

# Allow your Next.js app (localhost:3000) to talk to this server (localhost:5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Load Models & DB at Startup ---
print("Loading models and database... This may take a moment.")
PROCESSED_DIR = 'data/processed'
MODEL_NAME_CLIP = "openai/clip-vit-large-patch14-336"
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

clip_processor = CLIPProcessor.from_pretrained(MODEL_NAME_CLIP)
clip_model = CLIPModel.from_pretrained(MODEL_NAME_CLIP).to(device)
clip_model.eval()

# Load all database vectors and mask paths into memory
db_vectors = []
db_mask_paths = []
for mask_path in glob.glob(os.path.join(PROCESSED_DIR, '*_masks.npy')):
    file_base = os.path.basename(mask_path).replace('_masks.npy', '')
    vector_path = os.path.join(PROCESSED_DIR, f"{file_base}_vector.npy")
    
    if os.path.exists(vector_path):
        db_mask_paths.append(mask_path)
        db_vectors.append(np.load(vector_path))
print(f"✅ Models loaded on {device}. Database has {len(db_vectors)} items.")

# --- 3. Class Definitions & Helper Functions ---
TARGET_UI_CLASSES = [
    "SKY", "MOUNTAIN", "WATER_BODY", "FOREST_TREES", "FLOWERS",
    "BOULDERS_CLIFF", "WATERFALL", "PATH_ROAD", "GRASS_FIELD", "EARTH_LAND"
]
FRONTEND_RGB_MAP = {
    "SKY": "rgb(179,229,252)", "MOUNTAIN": "rgb(97,115,97)",
    "WATER_BODY": "rgb(74,163,210)", "FOREST_TREES": "rgb(46,139,87)",
    "FLOWERS": "rgb(231,154,184)", "BOULDERS_CLIFF": "rgb(164,159,154)",
    "WATERFALL": "rgb(137,214,255)", "PATH_ROAD": "rgb(191,168,147)",
    "GRASS_FIELD": "rgb(122,180,96)", "EARTH_LAND": "rgb(137,115,96)"
}
PIXEL_THRESHOLD = 100 # Min pixels to count a class
METRIC = 'iou'
WEIGHT_IOU = 0.7
WEIGHT_CLIP = 0.3
TOP_K = 5

def parse_rgb(rgb_string):
    match = re.search(r'rgb\((\d+),(\d+),(\d+)\)', rgb_string.replace(" ", ""))
    return tuple(int(x) for x in match.groups()) if match else (0, 0, 0)

def convert_sketch_png_to_masks(image_pil, rgb_map, target_classes):
    image_np = np.array(image_pil.convert("RGB"))
    parsed_rgb_map = {name: parse_rgb(rgb) for name, rgb in rgb_map.items()}
    num_classes = len(target_classes)
    stacked_masks = np.zeros((num_classes, image_np.shape[0], image_np.shape[1]), dtype=np.uint8)
    detected_classes = []
    
    for i, class_name in enumerate(target_classes):
        rgb_tuple = parsed_rgb_map.get(class_name)
        if rgb_tuple:
            mask = np.all(image_np == rgb_tuple, axis=2)
            if np.sum(mask) > PIXEL_THRESHOLD:
                detected_classes.append(class_name)
            stacked_masks[i] = mask.astype(np.uint8)
    return stacked_masks, image_pil, detected_classes

def resize_mask_stack(mask_stack, target_shape):
    num_channels, target_h, target_w = mask_stack.shape[0], target_shape[0], target_shape[1]
    if mask_stack.shape[1:] == target_shape: return mask_stack
    resized_stack = np.zeros((num_channels, target_h, target_w), dtype=np.uint8)
    for i in range(num_channels):
        img = Image.fromarray(mask_stack[i])
        img_resized = img.resize((target_w, target_h), Image.NEAREST)
        resized_stack[i] = np.array(img_resized)
    return resized_stack

def calculate_avg_channel_metric(mask_stack1, mask_stack2, metric='iou'):
    mask_stack2 = resize_mask_stack(mask_stack2, mask_stack1.shape[1:])
    scores = []
    for i in range(mask_stack1.shape[0]):
        mask1, mask2 = mask_stack1[i], mask_stack2[i]
        if metric == 'iou':
            intersection = np.sum(mask1 & mask2)
            union = np.sum(mask1 | mask2)
            score = 1.0 if union == 0 else intersection / union
        else: # 'dice'
            intersection = np.sum(mask1 * mask2)
            sum_masks = np.sum(mask1) + np.sum(mask2)
            score = 1.0 if sum_masks == 0 else (2.0 * intersection) / sum_masks
        scores.append(score)
    return np.mean(scores)

def calculate_cosine_similarity(vec1, vec2):
    vec1 = vec1 / np.linalg.norm(vec1)
    vec2 = vec2 / np.linalg.norm(vec2)
    return np.dot(vec1, vec2)

def generate_text_prompt_from_sketch(sketch_pil_image, color_map, detected_classes):
    print("Connecting to Gemini API...")
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
    except KeyError:
        print("FATAL: GOOGLE_API_KEY environment variable not set.")
        return "a scenic landscape", "Error: GOOGLE_API_KEY not set"
    
    color_key_prompt = "You are an expert at describing landscape art. Analyze a user's sketch and generate a descriptive search query.\n\nHere is the color key:\n"
    for class_name, rgb_string in color_map.items():
        color_key_prompt += f"- {class_name}: {rgb_string}\n"
    
    detected_classes_str = ", ".join(detected_classes)
    prompt_nudge = f"\nBased on the colors, the sketch contains: {detected_classes_str}.\n\n"
    
    json_instruction = (
        "Analyze the sketch and the detected elements. "
        "Generate a single, short, descriptive phrase (max 10 words) that captures the main elements and their spatial relationship. "
        "Focus on the key features.\n"
        "Your response MUST be a single, valid JSON object matching this schema:\n"
        "```json\n"
        "{\n"
        "  \"description\": \"A short, 10-word descriptive phrase for a search query.\",\n"
        "  \"main_features\": [\"list\", \"of\", \"detected\", \"elements\"]\n"
        "}\n"
        "```\n"
        "Example Response:\n"
        "```json\n"
        "{\n"
        "  \"description\": \"A large mountain reflecting in a blue lake.\",\n"
        "  \"main_features\": [\"MOUNTAIN\", \"WATER_BODY\"]\n"
        "}\n"
        "```"
    )
    full_prompt = color_key_prompt + prompt_nudge + json_instruction
    
    generation_config = genai.types.GenerationConfig(response_mime_type="application/json")
    model = genai.GenerativeModel('gemini-2.5-flash-lite', generation_config=generation_config)
    
    try:
        response = model.generate_content([full_prompt, sketch_pil_image])
        response_json = json.loads(response.text)
        generated_text = response_json.get("description", "a scenic landscape")
        print(f"Gemini-generated prompt: '{generated_text}'")
        return generated_text, generated_text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "a scenic landscape", f"Error: {e}"

# --- 4. The API Endpoint ---
@app.post("/api/search")
async def search_hikes(file: UploadFile = File(...)):
    try:
        print("\nReceived search request...")
        
        # 1. Process Input Image
        contents = await file.read()
        sketch_pil = Image.open(io.BytesIO(contents))
        user_mask_stack, _, detected_classes = convert_sketch_png_to_masks(
            sketch_pil, FRONTEND_RGB_MAP, TARGET_UI_CLASSES
        )
        
        # 2. Generate Text Prompt
        USER_TEXT_PROMPT, _ = generate_text_prompt_from_sketch(
            sketch_pil, FRONTEND_RGB_MAP, detected_classes
        )
        
        # 3. Encode Text
        text_inputs = clip_processor(text=[USER_TEXT_PROMPT], return_tensors="pt", padding=True).to(device)
        with torch.no_grad():
            text_features = clip_model.get_text_features(input_ids=text_inputs.input_ids)
        user_text_vector = text_features.squeeze().cpu().numpy()
        
        # 4. Run Search
        all_scores = []
        for i, db_mask_path in enumerate(db_mask_paths):
            db_mask_stack = np.load(db_mask_path)
            db_vector = db_vectors[i]
            
            comp_score = calculate_avg_channel_metric(user_mask_stack, db_mask_stack, metric=METRIC)
            clip_score = calculate_cosine_similarity(user_text_vector, db_vector)
            final_score = (WEIGHT_IOU * comp_score) + (WEIGHT_CLIP * clip_score)
            
            file_base = os.path.basename(db_mask_path).replace('_masks.npy', '')
            all_scores.append({
                'file_base': file_base,
                'score': final_score,
                'comp_score': comp_score,
                'clip_score': clip_score
            })
        
        # 5. Format Results
        top_k_results = sorted(all_scores, key=lambda x: x['score'], reverse=True)[:TOP_K]
        
        results_to_send = []
        for res in top_k_results:
            # Find the original file extension (.webp, .jpg, etc.)
            original_file = glob.glob(f"data/original/{res['file_base']}.*")[0]
            extension = os.path.splitext(original_file)[1]
            
            results_to_send.append({
                'id': res['file_base'],
                'score': res['score'],
                # These URLs point to the /public folder in Next.js
                'original_image_url': f"/images/original/{res['file_base']}{extension}",
                'segmentation_map_url': f"/images/processed/{res['file_base']}_ui_map.png"
            })

        print("Search complete, sending results.")
        return {"results": results_to_send}
        
    except Exception as e:
        print(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. Run the server ---
if __name__ == "__main__":
    print("Starting backend server on http://localhost:5000")
    uvicorn.run(app, host="127.0.0.1", port=5000)