import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Upload, ScanFace, ShieldCheck, X, Eye } from 'lucide-react';

export const VisionView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        setResult('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult('');
    
    try {
        const base64Data = selectedImage.split(',')[1];
        // Hardcoded prompt for the KYC simulation context
        const prompt = "Act as a security AI verification system. Analyze this image. If it looks like an ID card or document, describe its visible security features (holograms, text clarity) generally. If not, state it is not a valid document type. Be brief and professional.";
        
        const text = await analyzeImage(base64Data, mimeType, prompt);
        setResult(text);
    } catch (error) {
        setResult("Error en verificación. Intente nuevamente.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-12 max-w-5xl mx-auto w-full">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1C8C6E]/20 text-[#1C8C6E] mb-4">
             <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Verificación de Identidad (KYC)
        </h1>
        <p className="text-slate-400">Demostración de análisis de documentos mediante Visión Computarizada Gemini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6">
          <div 
            className={`relative border-2 border-dashed rounded-2xl transition-all h-80 flex flex-col items-center justify-center overflow-hidden
            ${selectedImage ? 'border-[#1C8C6E]/50 bg-[#1C8C6E]/5' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="h-full w-full object-contain p-4" />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-[#B23A48] text-white rounded-full transition-colors backdrop-blur-sm"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <Upload size={32} />
                </div>
                <p className="text-lg font-medium text-slate-200">Subir Documento (Demo)</p>
                <p className="text-sm text-slate-500 mt-2">No suba IDs reales. Use imágenes de prueba.</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
            ${!selectedImage || isAnalyzing
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-[#1C8C6E] text-white hover:bg-[#156b54] shadow-lg shadow-[#1C8C6E]/20'
            }`}
          >
            {isAnalyzing ? (
              <>
                  <ScanFace className="animate-pulse" size={20} /> Verificando...
              </>
            ) : (
              <>
                  <ShieldCheck size={20} /> Iniciar Análisis de Seguridad
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="glass-panel border border-white/10 rounded-2xl p-6 min-h-[400px] flex flex-col">
            <h3 className="text-lg font-heading font-semibold text-white mb-4 border-b border-white/10 pb-2">Log de Auditoría AI</h3>
            
            <div className="flex-1 overflow-y-auto">
                {result ? (
                    <div className="p-4 bg-[#1C8C6E]/10 border border-[#1C8C6E]/20 rounded-xl">
                         <div className="flex items-center gap-2 text-[#1C8C6E] mb-2 font-bold text-sm uppercase">
                            <ShieldCheck size={16} /> Análisis Completado
                         </div>
                        <div className="text-slate-300 text-sm leading-relaxed font-mono">
                            {result}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        {isAnalyzing ? (
                             <div className="text-center space-y-4">
                                <div className="w-16 h-16 border-4 border-[#1C8C6E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm animate-pulse">Escaneando características biométricas...</p>
                             </div>
                        ) : (
                            <>
                                <Eye size={48} className="mb-4 opacity-20" />
                                <p>Esperando entrada...</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};