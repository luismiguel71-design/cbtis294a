/**
 * Utility function to generate credential PDF using canvas
 * This provides an alternative to jspdf/html2canvas for better compatibility
 */

export async function generateCredentialImage(alumno: {
  id: string;
  nombre: string;
  carrera: string;
  grado: string;
  grupo: string;
  fotografia?: string;
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    
    // Set dimensions (5x3.5 inches at 300 DPI for a standard ID card)
    const width = 600;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // CBTIS 294 Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CBTIS 294', width / 2, 45);

    // Subtitle
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Centro de Bachillerato Tecnológico Industrial y de Servicios', width / 2, 65);

    // Main content area
    const contentStartY = 90;
    const contentStartX = 50;

    // Load and draw image if available
    if (alumno.fotografia) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Image frame
        const imgX = contentStartX + 20;
        const imgY = contentStartY;
        const imgWidth = 110;
        const imgHeight = 140;

        // Draw white border
        ctx.fillStyle = 'white';
        ctx.fillRect(imgX - 3, imgY - 3, imgWidth + 6, imgHeight + 6);

        // Draw image with rounded corners
        ctx.save();
        ctx.beginPath();
        const radius = 5;
        ctx.moveTo(imgX + radius, imgY);
        ctx.lineTo(imgX + imgWidth - radius, imgY);
        ctx.quadraticCurveTo(imgX + imgWidth, imgY, imgX + imgWidth, imgY + radius);
        ctx.lineTo(imgX + imgWidth, imgY + imgHeight - radius);
        ctx.quadraticCurveTo(imgX + imgWidth, imgY + imgHeight, imgX + imgWidth - radius, imgY + imgHeight);
        ctx.lineTo(imgX + radius, imgY + imgHeight);
        ctx.quadraticCurveTo(imgX, imgY + imgHeight, imgX, imgY + imgHeight - radius);
        ctx.lineTo(imgX, imgY + radius);
        ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();

        drawContent();
      };

      img.onerror = () => {
        // If image fails to load, draw placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(contentStartX + 20, contentStartY, 110, 140);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sin', contentStartX + 75, contentStartY + 65);
        ctx.fillText('foto', contentStartX + 75, contentStartY + 80);
        
        drawContent();
      };

      img.src = alumno.fotografia;
    } else {
      // Draw placeholder
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(contentStartX + 20, contentStartY, 110, 140);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin', contentStartX + 75, contentStartY + 65);
      ctx.fillText('foto', contentStartX + 75, contentStartY + 80);
      
      drawContent();
    }

    function drawContent() {
      const textX = contentStartX + 150;

      // Name label and value
      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'left';
      ctx.fillText('NOMBRE:', textX, contentStartY + 15);

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.nombre.substring(0, 30), textX, contentStartY + 38);

      // Career label and value
      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('CARRERA:', textX, contentStartY + 65);

      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = 'white';
      const carrera = alumno.carrera.substring(0, 24);
      ctx.fillText(carrera, textX, contentStartY + 85);

      // Grade and Group
      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('GRADO:', textX, contentStartY + 112);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.grado, textX, contentStartY + 132);

      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('GRUPO:', textX + 80, contentStartY + 112);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.grupo, textX + 80, contentStartY + 132);

      // Footer
      ctx.font = '11px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(`ID: ${alumno.id}`, width / 2, height - 30);

      ctx.font = '9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const currentYear = new Date().getFullYear();
      ctx.fillText(`Válida durante el ciclo escolar ${currentYear}-${currentYear + 1}`, width / 2, height - 12);

      // Convert to blob and resolve
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not generate canvas blob'));
        }
      }, 'image/png');
    }
  });
}

export async function downloadCredential(alumno: {
  id: string;
  nombre: string;
  carrera: string;
  grado: string;
  grupo: string;
  fotografia?: string;
}) {
  try {
    const blob = await generateCredentialImage(alumno);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credencial_${alumno.nombre.replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}
