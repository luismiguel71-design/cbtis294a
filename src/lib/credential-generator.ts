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

    // Decorative subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // CBTIS 294 Title
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = '900 28px Arial';
    ctx.fillText('CBTIS 294', 45, 55);

    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('BACHILLERATO TECNOLÓGICO', 45, 72);

    ctx.font = 'italic 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('SISTEMA DE IDENTIFICACIÓN ESCOLAR', width - 45, 60);

    // Main content area
    const contentStartY = 110;
    const contentStartX = 45;

    // Load and draw image if available
    if (alumno.fotografia) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Image frame
        const imgX = contentStartX;
        const imgY = contentStartY;
        const imgWidth = 130;
        const imgHeight = 165;

        // Image background/border
        ctx.fillStyle = 'white';
        ctx.fillRect(imgX - 2, imgY - 2, imgWidth + 4, imgHeight + 4);

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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(contentStartX, contentStartY, 130, 165);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SIN FOTO', contentStartX + 65, contentStartY + 85);
        
        drawContent();
      };

      img.src = alumno.fotografia;
    } else {
      // Draw placeholder
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(contentStartX, contentStartY, 130, 165);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SIN FOTO', contentStartX + 65, contentStartY + 85);
      
      drawContent();
    }

    function drawContent() {
      const textX = contentStartX + 165;

      // Name label and value
      ctx.font = 'bold 9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'left';
      ctx.fillText('ALUMNO', textX, contentStartY + 15);

      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.nombre.toUpperCase(), textX, contentStartY + 45);

      // Career label and value
      ctx.font = 'bold 9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('ESPECIALIDAD', textX, contentStartY + 80);

      ctx.font = 'bold 15px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.carrera.toUpperCase(), textX, contentStartY + 102);

      // Separator Line
      ctx.beginPath();
      ctx.moveTo(textX, contentStartY + 125);
      ctx.lineTo(width - 45, contentStartY + 125);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Grade and Group section
      const sectionWidth = (width - textX - 45) / 2;

      // Semester
      ctx.font = 'bold 9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('SEMESTRE', textX + sectionWidth / 2, contentStartY + 150);
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`${alumno.grado}°`, textX + sectionWidth / 2, contentStartY + 175);

      // Group
      ctx.font = 'bold 9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('GRUPO', textX + sectionWidth + sectionWidth / 2, contentStartY + 150);
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(alumno.grupo, textX + sectionWidth + sectionWidth / 2, contentStartY + 175);

      // Footer
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(`ID: ${alumno.id}`, width / 2, height - 40);

      ctx.font = '9px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const currentYear = new Date().getFullYear();
      ctx.fillText(`VÁLIDA DURANTE EL CICLO ESCOLAR ${currentYear}-${currentYear + 1}`, width / 2, height - 25);

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
