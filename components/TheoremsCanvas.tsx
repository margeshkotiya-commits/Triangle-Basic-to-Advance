import React, { useEffect, useRef } from "react";

export type TheoremType = "sss" | "sas" | "aaa" | "pythagoras" | "midpoint" | "angleBisector";

interface TheoremsCanvasProps {
  selectedTheorem: TheoremType;
  theoremStep: number;
}

export function TheoremsCanvas({ selectedTheorem, theoremStep }: TheoremsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    
    // Animation state
    let progress = 0;
    let targetProgress = 0;

    // Set target progress based on step
    if (theoremStep === 1) targetProgress = 0;
    else if (theoremStep === 2) targetProgress = 0.5;
    else if (theoremStep >= 3) targetProgress = 1;

    const render = () => {
      // Smooth interpolation
      progress += (targetProgress - progress) * 0.1;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Helper to draw triangle
      const drawTriangle = (pts: {x: number, y: number}[], stroke: string, fill: string, lineWidth = 2) => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke();
      };

      const drawLine = (p1: {x: number, y: number}, p2: {x: number, y: number}, stroke: string, lineWidth = 2, dash: number[] = []) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.setLineDash(dash);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.restore();
      };

      const drawText = (text: string, x: number, y: number, color = "white", font = "16px sans-serif") => {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
      };

      const drawInteriorArc = (
        vertex: {x: number, y: number},
        p1: {x: number, y: number},
        p2: {x: number, y: number},
        stroke: string,
        fill: string
      ) => {
        const AB = { x: p1.x - vertex.x, y: p1.y - vertex.y };
        const AC = { x: p2.x - vertex.x, y: p2.y - vertex.y };

        const lenAB = Math.hypot(AB.x, AB.y);
        const lenAC = Math.hypot(AC.x, AC.y);

        if (lenAB === 0 || lenAC === 0) return;

        const nvAB = { x: AB.x / lenAB, y: AB.y / lenAB };
        const nvAC = { x: AC.x / lenAC, y: AC.y / lenAC };

        // Compute angle using dot product
        const dot = nvAB.x * nvAC.x + nvAB.y * nvAC.y;
        let angle = Math.acos(Math.max(-1, Math.min(1, dot)));
        
        // Force minimum angle (anti-reflex fix)
        if (angle > Math.PI) {
          angle = 2 * Math.PI - angle;
        }

        const cross = nvAB.x * nvAC.y - nvAB.y * nvAC.x;
        const counterclockwise = cross < 0;

        // Clamp radius
        const radius = Math.min(lenAB * 0.2, lenAC * 0.2, 30);

        // Compute angle bisector
        const bisectorX = nvAB.x + nvAC.x;
        const bisectorY = nvAB.y + nvAC.y;
        const bisectorLen = Math.hypot(bisectorX, bisectorY);
        
        const offset = 0;
        const center = {
          x: vertex.x + (bisectorLen > 0 ? (bisectorX / bisectorLen) * offset : 0),
          y: vertex.y + (bisectorLen > 0 ? (bisectorY / bisectorLen) * offset : 0)
        };

        const angle1 = Math.atan2(nvAB.y, nvAB.x);
        const angle2 = Math.atan2(nvAC.y, nvAC.x);

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle1, angle2, counterclockwise);
        ctx.closePath();

        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      const cx = width / 2;
      const cy = height / 2;

      if (selectedTheorem === "sss") {
        // Two triangles, morphing or highlighting
        const t1 = [
          { x: cx - 150, y: cy + 50 },
          { x: cx - 50, y: cy + 50 },
          { x: cx - 100, y: cy - 50 }
        ];
        
        // t2 starts different, morphs to t1 translated
        const t2Start = [
          { x: cx + 50, y: cy + 80 },
          { x: cx + 180, y: cy + 20 },
          { x: cx + 100, y: cy - 80 }
        ];
        const t2End = [
          { x: cx + 50, y: cy + 50 },
          { x: cx + 150, y: cy + 50 },
          { x: cx + 100, y: cy - 50 }
        ];

        const t2 = t2Start.map((pt, i) => ({
          x: pt.x + (t2End[i].x - pt.x) * progress,
          y: pt.y + (t2End[i].y - pt.y) * progress
        }));

        drawTriangle(t1, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");
        drawTriangle(t2, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");

        if (theoremStep >= 2) {
          // Highlight sides
          const alpha = Math.min(1, progress * 2);
          drawLine(t1[0], t1[1], `rgba(244, 196, 48, ${alpha})`, 4);
          drawLine(t2[0], t2[1], `rgba(244, 196, 48, ${alpha})`, 4);
          
          if (theoremStep >= 3) {
            drawLine(t1[1], t1[2], `rgba(56, 189, 248, ${alpha})`, 4);
            drawLine(t2[1], t2[2], `rgba(56, 189, 248, ${alpha})`, 4);
            
            drawLine(t1[2], t1[0], `rgba(74, 222, 128, ${alpha})`, 4);
            drawLine(t2[2], t2[0], `rgba(74, 222, 128, ${alpha})`, 4);
          }
        }
      } 
      else if (selectedTheorem === "sas") {
        const t1 = [
          { x: cx - 150, y: cy + 50 },
          { x: cx - 50, y: cy + 50 },
          { x: cx - 100, y: cy - 50 }
        ];
        const t2 = [
          { x: cx + 50, y: cy + 50 },
          { x: cx + 150, y: cy + 50 },
          { x: cx + 100, y: cy - 50 }
        ];

        drawTriangle(t1, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");
        drawTriangle(t2, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");

        if (theoremStep >= 2) {
          const alpha = Math.min(1, progress * 2);
          // Side 1
          drawLine(t1[0], t1[1], `rgba(244, 196, 48, ${alpha})`, 4);
          drawLine(t2[0], t2[1], `rgba(244, 196, 48, ${alpha})`, 4);
          
          // Angle
          drawInteriorArc(t1[0], t1[1], t1[2], `rgba(56, 189, 248, ${alpha})`, `rgba(56, 189, 248, ${alpha * 0.3})`);
          drawInteriorArc(t2[0], t2[1], t2[2], `rgba(56, 189, 248, ${alpha})`, `rgba(56, 189, 248, ${alpha * 0.3})`);
          
          if (theoremStep >= 3) {
            // Side 2
            drawLine(t1[0], t1[2], `rgba(74, 222, 128, ${alpha})`, 4);
            drawLine(t2[0], t2[2], `rgba(74, 222, 128, ${alpha})`, 4);
          }
        }
      }
      else if (selectedTheorem === "aaa") {
        const t1 = [
          { x: cx - 150, y: cy + 80 },
          { x: cx - 50, y: cy + 80 },
          { x: cx - 100, y: cy - 20 }
        ];
        
        // t2 scales up
        const scale = 1 + progress * 0.5;
        const t2Center = { x: cx + 100, y: cy + 30 };
        const t2 = [
          { x: t2Center.x - 50 * scale, y: t2Center.y + 50 * scale },
          { x: t2Center.x + 50 * scale, y: t2Center.y + 50 * scale },
          { x: t2Center.x, y: t2Center.y - 50 * scale }
        ];

        drawTriangle(t1, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");
        drawTriangle(t2, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");

        if (theoremStep >= 2) {
          const alpha = Math.min(1, progress * 2);
          drawInteriorArc(t1[0], t1[1], t1[2], `rgba(244, 196, 48, ${alpha})`, "");
          drawInteriorArc(t2[0], t2[1], t2[2], `rgba(244, 196, 48, ${alpha})`, "");
          
          drawInteriorArc(t1[1], t1[0], t1[2], `rgba(56, 189, 248, ${alpha})`, "");
          drawInteriorArc(t2[1], t2[0], t2[2], `rgba(56, 189, 248, ${alpha})`, "");
          
          if (theoremStep >= 3) {
            drawInteriorArc(t1[2], t1[0], t1[1], `rgba(74, 222, 128, ${alpha})`, "");
            drawInteriorArc(t2[2], t2[0], t2[1], `rgba(74, 222, 128, ${alpha})`, "");
          }
        }
      }
      else if (selectedTheorem === "pythagoras") {
        const a = 120; // base
        const b = 90;  // height
        const pts = [
          { x: cx - a/2, y: cy + b/2 }, // bottom-left (right angle)
          { x: cx + a/2, y: cy + b/2 }, // bottom-right
          { x: cx - a/2, y: cy - b/2 }  // top-left
        ];

        // Step 1: Show triangle
        drawTriangle(pts, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");
        
        // Highlight right angle
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(pts[0].x, pts[0].y - 15, 15, 15);

        // Step 2: Label sides
        if (theoremStep >= 2) {
          const alpha = Math.min(1, progress * 2);
          drawText("a", pts[0].x + a/2, pts[0].y + 20, `rgba(56, 189, 248, ${alpha})`, "bold 18px sans-serif");
          drawText("b", pts[0].x - 20, pts[0].y - b/2, `rgba(74, 222, 128, ${alpha})`, "bold 18px sans-serif");
          drawText("c", pts[1].x - a/2 + 20, pts[1].y - b/2 - 20, `rgba(244, 196, 48, ${alpha})`, "bold 18px sans-serif");
        }

        const c = Math.hypot(a, b);
        const angle = Math.atan2(pts[2].y - pts[1].y, pts[2].x - pts[1].x);
        const centerC_x = pts[1].x + (c/2) * Math.cos(angle) - (c/2) * Math.sin(angle);
        const centerC_y = pts[1].y + (c/2) * Math.sin(angle) + (c/2) * Math.cos(angle);

        // Step 3: Highlight side 'a' and draw square
        if (theoremStep >= 3) {
          const alpha = theoremStep === 3 ? Math.min(1, progress * 2) : 1;
          const moveProgress = theoremStep > 6 ? 1 : (theoremStep === 6 ? progress : 0);
          
          ctx.save();
          if (theoremStep >= 6) {
            const startX = pts[0].x + a/2;
            const startY = pts[0].y + a/2;
            const currentX = startX + (centerC_x - startX) * moveProgress;
            const currentY = startY + (centerC_y - startY) * moveProgress;
            
            ctx.translate(currentX - a/2, currentY - a/2);
            ctx.globalAlpha = 1 - moveProgress;
          } else {
            ctx.translate(pts[0].x, pts[0].y);
            ctx.globalAlpha = alpha;
          }
          
          ctx.fillStyle = `rgba(56, 189, 248, 0.3)`;
          ctx.strokeStyle = `rgba(56, 189, 248, 1)`;
          ctx.fillRect(0, 0, a, a);
          ctx.strokeRect(0, 0, a, a);
          drawText("a²", a/2, a/2, `rgba(56, 189, 248, 1)`);
          ctx.restore();
          
          if (theoremStep === 3) {
            drawLine(pts[0], pts[1], `rgba(56, 189, 248, ${alpha})`, 4);
          }
        }

        // Step 4: Highlight side 'b' and draw square
        if (theoremStep >= 4) {
          const alpha = theoremStep === 4 ? Math.min(1, progress * 2) : 1;
          const moveProgress = theoremStep > 6 ? 1 : (theoremStep === 6 ? progress : 0);
          
          ctx.save();
          if (theoremStep >= 6) {
            const startX = pts[2].x - b/2;
            const startY = pts[2].y + b/2;
            const currentX = startX + (centerC_x - startX) * moveProgress;
            const currentY = startY + (centerC_y - startY) * moveProgress;
            
            ctx.translate(currentX - b/2, currentY - b/2);
            ctx.globalAlpha = 1 - moveProgress;
          } else {
            ctx.translate(pts[2].x - b, pts[2].y);
            ctx.globalAlpha = alpha;
          }
          
          ctx.fillStyle = `rgba(74, 222, 128, 0.3)`;
          ctx.strokeStyle = `rgba(74, 222, 128, 1)`;
          ctx.fillRect(0, 0, b, b);
          ctx.strokeRect(0, 0, b, b);
          drawText("b²", b/2, b/2, `rgba(74, 222, 128, 1)`);
          ctx.restore();
          
          if (theoremStep === 4) {
            drawLine(pts[0], pts[2], `rgba(74, 222, 128, ${alpha})`, 4);
          }
        }

        // Step 5: Highlight hypotenuse 'c' and draw square
        if (theoremStep >= 5) {
          const alpha = theoremStep === 5 ? Math.min(1, progress * 2) : 1;
          
          ctx.save();
          ctx.translate(pts[1].x, pts[1].y);
          ctx.rotate(angle);
          
          const fillAlpha = theoremStep > 6 ? 0.8 : (theoremStep === 6 ? 0.3 + 0.5 * progress : 0.3 * alpha);
          
          ctx.fillStyle = `rgba(244, 196, 48, ${fillAlpha})`;
          ctx.strokeStyle = `rgba(244, 196, 48, ${alpha})`;
          ctx.fillRect(0, 0, c, c);
          ctx.strokeRect(0, 0, c, c);
          
          ctx.translate(c/2, c/2);
          ctx.rotate(-angle);
          drawText("c²", 0, 0, `rgba(244, 196, 48, ${alpha})`);
          ctx.restore();
          
          if (theoremStep === 5) {
            drawLine(pts[1], pts[2], `rgba(244, 196, 48, ${alpha})`, 4);
          }
        }
      }
      else if (selectedTheorem === "midpoint") {
        const pts = [
          { x: cx - 100, y: cy + 100 },
          { x: cx + 150, y: cy + 100 },
          { x: cx, y: cy - 100 }
        ];
        drawTriangle(pts, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");

        if (theoremStep >= 2) {
          const alpha = Math.min(1, progress * 2);
          const m1 = { x: (pts[0].x + pts[2].x)/2, y: (pts[0].y + pts[2].y)/2 };
          const m2 = { x: (pts[1].x + pts[2].x)/2, y: (pts[1].y + pts[2].y)/2 };

          // Draw midpoints
          ctx.fillStyle = `rgba(244, 196, 48, ${alpha})`;
          ctx.beginPath(); ctx.arc(m1.x, m1.y, 5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(m2.x, m2.y, 5, 0, Math.PI*2); ctx.fill();

          if (theoremStep >= 3) {
            // Draw mid-segment
            drawLine(m1, m2, `rgba(56, 189, 248, ${alpha})`, 3);
            // Highlight base
            drawLine(pts[0], pts[1], `rgba(74, 222, 128, ${alpha})`, 3);
            
            drawText("Parallel & Half Length", cx, cy, `rgba(255, 255, 255, ${alpha})`);
          }
        }
      }
      else if (selectedTheorem === "angleBisector") {
        // A is top, B is bottom-left, C is bottom-right
        const pts = [
          { x: cx - 120, y: cy + 100 }, // B
          { x: cx + 120, y: cy + 100 }, // C
          { x: cx - 40, y: cy - 100 }   // A
        ];
        
        // Step 1: Show triangle ABC
        drawTriangle(pts, "rgba(255,255,255,0.8)", "rgba(255,255,255,0.1)");
        drawText("B", pts[0].x - 20, pts[0].y + 20, "rgba(255,255,255,0.8)");
        drawText("C", pts[1].x + 20, pts[1].y + 20, "rgba(255,255,255,0.8)");
        drawText("A", pts[2].x, pts[2].y - 20, "rgba(255,255,255,0.8)");

        const alpha = Math.min(1, progress * 2);

        // Step 2: Highlight angle A
        if (theoremStep >= 2 && theoremStep < 4) {
          drawInteriorArc(pts[1], pts[2], pts[0], `rgba(244, 196, 48, ${theoremStep === 2 ? alpha : 1})`, "");
        }

        // Calculate angle bisector intersection with base (point D)
        const c = Math.hypot(pts[2].x - pts[0].x, pts[2].y - pts[0].y); // AB
        const b = Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y); // AC
        
        const intersectX = (b * pts[0].x + c * pts[1].x) / (b + c);
        const intersectY = (b * pts[0].y + c * pts[1].y) / (b + c);
        const intersect = { x: intersectX, y: intersectY }; // D

        // Step 3: Draw bisector from A to BC (point D)
        if (theoremStep >= 3) {
          const drawProgress = theoremStep === 3 ? Math.min(1, progress * 1.5) : 1;
          const currentD = {
            x: pts[2].x + (intersect.x - pts[2].x) * drawProgress,
            y: pts[2].y + (intersect.y - pts[2].y) * drawProgress
          };
          drawLine(pts[2], currentD, `rgba(244, 196, 48, ${theoremStep === 3 ? alpha : 1})`, 3, [5, 5]);
          if (drawProgress >= 0.9) {
            drawText("D", intersect.x, intersect.y + 25, `rgba(255,255,255,${theoremStep === 3 ? (drawProgress - 0.9) * 10 : 1})`);
          }
        }

        // Step 4: Highlight equal angles
        if (theoremStep >= 4) {
          const splitAlpha = theoremStep === 4 ? alpha : 1;
          // Draw two separate arcs
          drawInteriorArc(intersect, pts[2], pts[0], `rgba(244, 196, 48, ${splitAlpha})`, "");
          drawInteriorArc(pts[1], pts[2], intersect, `rgba(244, 196, 48, ${splitAlpha})`, "");
          
          // Add tick marks to show equality
          const angle1 = Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x);
          const angle2 = Math.atan2(intersect.y - pts[2].y, intersect.x - pts[2].x);
          const angle3 = Math.atan2(pts[1].y - pts[2].y, pts[1].x - pts[2].x);
          
          const midAngle1 = (angle1 + angle2) / 2;
          const midAngle2 = (angle2 + angle3) / 2;
          
          const tickDist = 35;
          const tick1 = { x: pts[2].x + Math.cos(midAngle1) * tickDist, y: pts[2].y + Math.sin(midAngle1) * tickDist };
          const tick2 = { x: pts[2].x + Math.cos(midAngle2) * tickDist, y: pts[2].y + Math.sin(midAngle2) * tickDist };
          
          drawLine({x: tick1.x - 4, y: tick1.y - 4}, {x: tick1.x + 4, y: tick1.y + 4}, `rgba(244, 196, 48, ${splitAlpha})`, 2);
          drawLine({x: tick2.x - 4, y: tick2.y - 4}, {x: tick2.x + 4, y: tick2.y + 4}, `rgba(244, 196, 48, ${splitAlpha})`, 2);
        }

        // Step 5: Highlight segments BD and DC
        if (theoremStep >= 5) {
          const segAlpha = theoremStep === 5 ? alpha : 1;
          drawLine(pts[0], intersect, `rgba(56, 189, 248, ${segAlpha})`, 5); // BD (blue)
          drawLine(intersect, pts[1], `rgba(74, 222, 128, ${segAlpha})`, 5); // DC (green)
          
          // Show lengths
          const lenBD = Math.hypot(intersect.x - pts[0].x, intersect.y - pts[0].y) / 20;
          const lenDC = Math.hypot(pts[1].x - intersect.x, pts[1].y - intersect.y) / 20;
          drawText(lenBD.toFixed(1), (pts[0].x + intersect.x) / 2, (pts[0].y + intersect.y) / 2 + 20, `rgba(56, 189, 248, ${segAlpha})`, "14px sans-serif");
          drawText(lenDC.toFixed(1), (intersect.x + pts[1].x) / 2, (intersect.y + pts[1].y) / 2 + 20, `rgba(74, 222, 128, ${segAlpha})`, "14px sans-serif");
        }

        // Step 6: Show proportional relationship (highlight AB and AC)
        if (theoremStep >= 6) {
          const propAlpha = theoremStep === 6 ? alpha : 1;
          drawLine(pts[0], pts[2], `rgba(56, 189, 248, ${propAlpha})`, 5); // AB (blue)
          drawLine(pts[1], pts[2], `rgba(74, 222, 128, ${propAlpha})`, 5); // AC (green)
          
          // Show lengths
          const lenAB = c / 20;
          const lenAC = b / 20;
          drawText(lenAB.toFixed(1), (pts[0].x + pts[2].x) / 2 - 20, (pts[0].y + pts[2].y) / 2 - 10, `rgba(56, 189, 248, ${propAlpha})`, "14px sans-serif");
          drawText(lenAC.toFixed(1), (pts[1].x + pts[2].x) / 2 + 20, (pts[1].y + pts[2].y) / 2 - 10, `rgba(74, 222, 128, ${propAlpha})`, "14px sans-serif");
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedTheorem, theoremStep]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
