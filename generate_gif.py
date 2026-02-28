import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_gif():
    frames = []
    width, height = 800, 500
    num_frames = 90
    
    # Define people properties: (x_center_ratio, y_center_ratio, size_ratio, speed)
    people = [
        {"x_start": 0.25, "y_start": 0.45, "x_end": 0.15, "y_end": 0.65, "size_start": 20, "size_end": 70, "name": "EMP-8821", "status": "AUTHORIZED", "color": "#00FF66"},
        {"x_start": 0.5, "y_start": 0.50, "x_end": 0.5, "y_end": 0.75, "size_start": 25, "size_end": 85, "name": "EMP-1093", "status": "AUTHORIZED", "color": "#00FF66"},
        {"x_start": 0.75, "y_start": 0.40, "x_end": 0.85, "y_end": 0.60, "size_start": 18, "size_end": 55, "name": "UNKNOWN", "status": "UNAUTHORIZED", "color": "#FF3333"},
        {"x_start": 0.38, "y_start": 0.42, "x_end": 0.35, "y_end": 0.55, "size_start": 15, "size_end": 45, "name": "VIS-5521", "status": "VISITOR", "color": "#00CCFF"},
    ]

    try:
        font_large = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", 16)
        font_small = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", 12)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    for i in range(num_frames):
        # Create a dark tech background
        img = Image.new('RGB', (width, height), color=(15, 20, 30))
        draw = ImageDraw.Draw(img)
        
        # Draw some tech grid lines
        for x in range(0, width, 40):
            draw.line([(x, 0), (x, height)], fill=(25, 35, 50), width=1)
        for y in range(0, height, 40):
            draw.line([(0, y), (width, y)], fill=(25, 35, 50), width=1)
            
        progress = i / (num_frames - 1)
        
        # Sort people by size so larger (closer) ones are drawn last
        current_people_state = []
        for person in people:
            x = width * (person["x_start"] + (person["x_end"] - person["x_start"]) * progress)
            y = height * (person["y_start"] + (person["y_end"] - person["y_start"]) * progress)
            size = person["size_start"] + (person["size_end"] - person["size_start"]) * progress
            current_people_state.append((size, x, y, person))
            
        current_people_state.sort(key=lambda item: item[0])
        
        for size, x, y, person in current_people_state:
            
            # Draw person (simple silhouette: circle for head, rounded rect for body)
            head_radius = size
            head_bbox = [x - head_radius, y - head_radius*2, x + head_radius, y]
            draw.ellipse(head_bbox, fill=(80, 100, 130))
            
            body_bbox = [x - head_radius*1.5, y + 5, x + head_radius*1.5, y + head_radius*4]
            # using rectangle for modern look
            draw.rectangle(body_bbox, fill=(60, 80, 110))
            
            # Face detection logic
            # Offset it based on person for staggered detection
            identification_threshold = 0.3 + (people.index(person) * 0.1)
            
            if progress > identification_threshold - 0.2:
                # bounding box
                box_pad = size * 0.2
                bbox = [head_bbox[0] - box_pad, head_bbox[1] - box_pad, head_bbox[2] + box_pad, head_bbox[3] + box_pad]
                
                # Draw box only if fully identified, otherwise draw scanning lines
                if progress > identification_threshold:
                    draw.rectangle(bbox, outline=person["color"], width=max(1, int(size/15)))
                    
                    # Corner accents
                    cl = size * 0.4 # corner length
                    cw = max(2, int(size/10))
                    # top left
                    draw.line([(bbox[0], bbox[1]+cl), (bbox[0], bbox[1]), (bbox[0]+cl, bbox[1])], fill=person["color"], width=cw)
                    # top right
                    draw.line([(bbox[2]-cl, bbox[1]), (bbox[2], bbox[1]), (bbox[2], bbox[1]+cl)], fill=person["color"], width=cw)
                    # bottom left
                    draw.line([(bbox[0], bbox[3]-cl), (bbox[0], bbox[3]), (bbox[0]+cl, bbox[3])], fill=person["color"], width=cw)
                    # bottom right
                    draw.line([(bbox[2]-cl, bbox[3]), (bbox[2], bbox[3]), (bbox[2], bbox[3]-cl)], fill=person["color"], width=cw)
    
                else:
                    # Scanning effect
                    scan_y = bbox[1] + (bbox[3] - bbox[1]) * ((progress - (identification_threshold - 0.2)) / 0.2)
                    draw.line([(bbox[0], scan_y), (bbox[2], scan_y)], fill=(0, 255, 255), width=2)
                
            # Identify after threshold
            if progress > identification_threshold:
                # popup line
                line_end_x = bbox[2] + size * 0.5
                line_end_y = bbox[1] - size * 0.5
                draw.line([(bbox[2], bbox[1]), (line_end_x, line_end_y)], fill=person["color"], width=2)
                
                # popup box
                popup_w, popup_h = 120, 50
                popup_bbox = [line_end_x, line_end_y - popup_h, line_end_x + popup_w, line_end_y]
                
                # Semi-transparent background for popup
                # PIL doesn't support drawing transparent rect directly on RGB without alpha compositing
                # We'll just draw a solid very dark rect
                draw.rectangle(popup_bbox, fill=(20, 25, 35), outline=person["color"], width=1)
                
                # Text
                text_y = line_end_y - popup_h + 8
                draw.text((line_end_x + 8, text_y), person["name"], font=font_large, fill=person["color"])
                draw.text((line_end_x + 8, text_y + 22), person["status"], font=font_small, fill=person["color"])

        # HUD overlay elements
        draw.text((20, 20), "SYSTEM: ACTIVE", font=font_large, fill=(0, 255, 255))
        draw.text((20, 45), f"TRACKING: {len(current_people_state)} SUBJECTS", font=font_small, fill=(0, 255, 255))
        draw.text((width - 150, 20), "REC: 1080p 60FPS", font=font_large, fill=(255, 50, 50))
        
        frames.append(img)
        
    output_path = r"d:\Swarag\Workspace\Qlsdynamics\qlsdynamics-website\public\images\dynamic_face_tracking.gif"
    frames[0].save(output_path, save_all=True, append_images=frames[1:], optimize=False, duration=50, loop=0)
    print(f"GIF built at {output_path}")

create_gif()
