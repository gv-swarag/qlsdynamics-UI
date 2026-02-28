const PImage = require('pureimage');
const fs = require('fs');
const GIFEncoder = require('gif-encoder-2');

async function createGif() {
    const width = 800;
    const height = 500;
    const numFrames = 90;

    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(50); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // Define people properties: (x_start_ratio, y_start_ratio, x_end_ratio, y_end_ratio, size_start, size_end, name, status, color)
    const people = [
        { x_start: 0.15, y_start: 0.45, x_end: 0.15, y_end: 0.65, size_start: 22, size_end: 75, status: "AUTHORIZED", color: "#00FF66" },
        { x_start: 0.38, y_start: 0.40, x_end: 0.38, y_end: 0.60, size_start: 18, size_end: 60, status: "VISITOR", color: "#00CCFF" },
        { x_start: 0.62, y_start: 0.48, x_end: 0.62, y_end: 0.70, size_start: 24, size_end: 80, status: "AUTHORIZED", color: "#00FF66" },
        { x_start: 0.85, y_start: 0.42, x_end: 0.85, y_end: 0.62, size_start: 20, size_end: 70, status: "UNAUTHORIZED", color: "#FF3333" },
    ];

    const fnt = PImage.registerFont('C:\\Windows\\Fonts\\consola.ttf', 'Consolas');
    await new Promise((resolve, reject) => {
        try {
            fnt.loadSync();
            resolve();
        } catch (e) {
            resolve();
        }
    });

    for (let i = 0; i < numFrames; i++) {
        const img = PImage.make(width, height);
        const ctx = img.getContext('2d');

        ctx.fillStyle = "#0F141E";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "#192332";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        const progress = i / (numFrames - 1);

        let current_people_state = people.map((p, idx) => {
            const x = width * (p.x_start + (p.x_end - p.x_start) * progress);
            const y = height * (p.y_start + (p.y_end - p.y_start) * progress);
            const size = p.size_start + (p.size_end - p.size_start) * progress;
            return { size, x, y, person: p, idx };
        });

        current_people_state.sort((a, b) => a.size - b.size);

        for (const { size, x, y, person, idx } of current_people_state) {

            ctx.fillStyle = "#506482";
            ctx.beginPath();
            ctx.arc(x, y - size, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#3C506E";
            ctx.beginPath();
            const bw = size * 1.5;
            const bh = size * 4;
            ctx.fillRect(x - bw, y + 5, bw * 2, bh);

            const identification_threshold = 0.3 + (idx * 0.1);

            if (progress > identification_threshold - 0.2) {
                const box_pad = size * 0.2;
                const bx = x - size - box_pad;
                const by = y - size * 2 - box_pad;
                const bw2 = (size + box_pad) * 2;
                const bh2 = (size * 2 + box_pad);

                if (progress > identification_threshold) {
                    ctx.strokeStyle = person.color;
                    ctx.lineWidth = Math.max(1, Math.floor(size / 15));
                    ctx.strokeRect(bx, by, bw2, bh2);

                    const cl = size * 0.4;
                    const cw = Math.max(2, Math.floor(size / 10));
                    ctx.strokeStyle = person.color;
                    ctx.lineWidth = cw;

                    ctx.beginPath(); ctx.moveTo(bx, by + cl); ctx.lineTo(bx, by); ctx.lineTo(bx + cl, by); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(bx + bw2 - cl, by); ctx.lineTo(bx + bw2, by); ctx.lineTo(bx + bw2, by + cl); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(bx, by + bh2 - cl); ctx.lineTo(bx, by + bh2); ctx.lineTo(bx + cl, by + bh2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(bx + bw2 - cl, by + bh2); ctx.lineTo(bx + bw2, by + bh2); ctx.lineTo(bx + bw2, by + bh2 - cl); ctx.stroke();

                    const p_start_x = bx + bw2 / 2;
                    const p_start_y = by;
                    let p_end_x = bx + bw2 / 2;
                    let p_end_y = by - 30;

                    // Fan out the popups securely so they don't overlap vertically/horizontally
                    if (x < width * 0.25) {
                        p_end_x -= 100;
                        p_end_y -= 10;
                    } else if (x < width * 0.50) {
                        p_end_x -= 40;
                        p_end_y -= 50;
                    } else if (x < width * 0.75) {
                        p_end_x += 40;
                        p_end_y -= 10;
                    } else {
                        p_end_x += 100;
                        p_end_y -= 50;
                    }

                    const pw = 130;
                    const ph = 30;

                    let px = p_end_x - pw / 2;
                    // Cap horizontal position
                    if (px < 5) px = 5;
                    if (px + pw > width - 5) px = width - pw - 5;

                    const py = p_end_y - ph;

                    ctx.strokeStyle = person.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(p_start_x, p_start_y); ctx.lineTo(p_end_x, p_end_y); ctx.stroke();

                    ctx.fillStyle = "#141923";
                    ctx.fillRect(px, py, pw, ph);
                    ctx.strokeStyle = person.color;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(px, py, pw, ph);


                    ctx.fillStyle = person.color;
                    ctx.font = "12pt Consolas";
                    ctx.fillText(person.status, px + 8, py + 20);

                } else {
                    const scan_progress = (progress - (identification_threshold - 0.2)) / 0.2;
                    const scan_y = by + bh2 * scan_progress;
                    ctx.strokeStyle = "#00FFFF";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(bx, scan_y); ctx.lineTo(bx + bw2, scan_y); ctx.stroke();
                }
            }
        }

        ctx.fillStyle = "#00FFFF";
        ctx.font = "16pt Consolas";
        ctx.fillText("SYSTEM: ACTIVE", 20, 30);

        encoder.addFrame(ctx);
        if (i % 10 === 0) console.log("Rendered frame", i);
    }

    encoder.finish();
    const buffer = encoder.out.getData();
    fs.writeFileSync('./public/images/dynamic_face_tracking.gif', buffer);
    console.log("GIF successfully generated! Size:", buffer.length);
}

createGif().catch(console.error);
