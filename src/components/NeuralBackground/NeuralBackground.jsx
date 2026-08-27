import { useEffect, useRef } from "react";

function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let nodes = [];

    const mouse = {
      x: null,
      y: null,
    };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createNodes() {
      nodes = [];

      const numberOfNodes = Math.floor(
        (window.innerWidth * window.innerHeight) / 18000
      );

      for (let i = 0; i < numberOfNodes; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
        });
      }
    }

    function drawNode(node) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(120, 220, 255, 0.8)";
      ctx.fill();
    }

    function drawConnections() {
      const connectionDistance = 150;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            ctx.strokeStyle = `rgba(120, 220, 255, ${opacity * 0.25})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function updateNodes() {
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
        }

        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            node.x -= dx * 0.001;
            node.y -= dy * 0.001;
          }
        }
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updateNodes();
      drawConnections();

      nodes.forEach(drawNode);

      animationFrameId = requestAnimationFrame(animate);
    }

    function handleMouseMove(event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }

    function handleMouseLeave() {
      mouse.x = null;
      mouse.y = null;
    }

    resizeCanvas();
    createNodes();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createNodes();
    });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-background" />;
}

export default NeuralBackground;