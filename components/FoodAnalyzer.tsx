
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface FoodAnalyzerProps {
  onSave: (result: AnalysisResult, image: string) => void;
  onCancel: () => void;
  mode: 'track' | 'analyze'; // 'track' adds to log, 'analyze' just shows info
}

export const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onSave, onCancel, mode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [editableResult, setEditableResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        performAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async (base64Img: string) => {
    setAnalyzing(true);
    setError(null);
    setEditableResult(null);
    try {
      const analysis = await analyzeFoodImage(base64Img);
      setEditableResult(analysis);
    } catch (err) {
      setError("Falha ao analisar a imagem. Por favor, tente novamente com uma foto mais nítida.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Limpa tudo para tirar nova foto
  const handleClearImage = () => {
    setImage(null);
    setEditableResult(null);
    setError(null);
  };

  // Mantém a imagem mas refaz a chamada para a IA
  const handleReanalyze = () => {
    if (image) {
      performAnalysis(image);
    }
  };

  const updateField = (field: keyof AnalysisResult, value: string | number) => {
    if (editableResult) {
      setEditableResult({ ...editableResult, [field]: value });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          {mode === 'track' ? 'Adicionar Refeição' : 'Análise de Alimentos'}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-surfaceHighlight rounded-full text-textMuted">
          <X size={24} />
        </button>
      </div>

      {!image ? (
        <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center bg-surface hover:bg-surfaceHighlight transition-colors cursor-pointer relative"
             onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" // Forces camera on mobile often
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Camera size={32} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Tire uma foto ou faça upload</h3>
          <p className="text-textMuted max-w-xs mx-auto">
            Nossa IA identificará o alimento e calculará a tabela nutricional instantaneamente.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl overflow-hidden shadow-xl border border-white/10">
          <div className="relative h-64 w-full bg-black">
            <img src={image} alt="Food" className="w-full h-full object-contain" />
            <div className="absolute top-4 right-4 flex gap-2">
                 <button 
                  onClick={handleClearImage}
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md"
                  title="Tirar outra foto"
                >
                  <X size={20} />
                </button>
            </div>
          </div>

          <div className="p-6">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-lg text-white font-medium">Analisando sua comida deliciosa...</p>
                <p className="text-sm text-textMuted">Identificando ingredientes e calculando macros</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                  <h4 className="text-red-500 font-medium">Falha na Análise</h4>
                  <p className="text-red-400/80 text-sm mt-1">{error}</p>
                  <button onClick={handleReanalyze} className="mt-3 text-sm text-red-500 underline">Tentar Novamente</button>
                </div>
              </div>
            ) : editableResult ? (
              <div className="animate-fade-in space-y-6">
                
                {/* Header with Name and Portion */}
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <label className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1 block">Nome do Prato</label>
                    <input 
                      type="text"
                      value={editableResult.foodName}
                      onChange={(e) => updateField('foodName', e.target.value)}
                      className="text-2xl font-bold text-white bg-transparent border-b border-white/10 focus:border-primary focus:outline-none w-full pb-1"
                    />
                  </div>
                  <div className="w-full">
                     <label className="text-xs text-textMuted uppercase tracking-wider font-semibold mb-1 block flex items-center gap-1">
                        Porção Aproximada <Edit2 size={10} />
                     </label>
                     <input 
                        type="text"
                        value={editableResult.portion || ''}
                        onChange={(e) => updateField('portion', e.target.value)}
                        className="text-white bg-surfaceHighlight/50 border border-white/10 rounded-lg px-3 py-2 w-full focus:border-primary focus:outline-none"
                     />
                  </div>
                </div>

                {/* Macro Grid - Editable */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {/* Calories */}
                   <div className="bg-surfaceHighlight p-3 rounded-xl">
                      <label className="text-xs text-textMuted mb-1 block">Calorias (kcal)</label>
                      <input 
                        type="number"
                        value={editableResult.calories}
                        onChange={(e) => updateField('calories', Number(e.target.value))}
                        className="w-full bg-transparent text-2xl font-bold text-primary border-b border-transparent hover:border-white/10 focus:border-primary focus:outline-none"
                      />
                   </div>

                   {/* Protein */}
                   <div className="bg-surfaceHighlight p-3 rounded-xl">
                      <label className="text-xs text-textMuted mb-1 block">Proteínas (g)</label>
                      <input 
                        type="number"
                        value={editableResult.protein}
                        onChange={(e) => updateField('protein', Number(e.target.value))}
                        className="w-full bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-white/10 focus:border-emerald-500 focus:outline-none"
                      />
                      <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
                      </div>
                   </div>

                   {/* Carbs */}
                   <div className="bg-surfaceHighlight p-3 rounded-xl">
                      <label className="text-xs text-textMuted mb-1 block">Carboidratos (g)</label>
                      <input 
                        type="number"
                        value={editableResult.carbs}
                        onChange={(e) => updateField('carbs', Number(e.target.value))}
                        className="w-full bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-white/10 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
                      </div>
                   </div>

                   {/* Fat */}
                   <div className="bg-surfaceHighlight p-3 rounded-xl">
                      <label className="text-xs text-textMuted mb-1 block">Gorduras (g)</label>
                      <input 
                        type="number"
                        value={editableResult.fat}
                        onChange={(e) => updateField('fat', Number(e.target.value))}
                        className="w-full bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-white/10 focus:border-yellow-500 focus:outline-none"
                      />
                      <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full" style={{ width: '100%' }}></div>
                      </div>
                   </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-textMuted mb-2 uppercase tracking-wider">Ingredientes Detectados</h4>
                  <div className="flex flex-wrap gap-2">
                    {editableResult.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-surfaceHighlight rounded-full text-sm text-gray-300">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button 
                    onClick={() => onSave(editableResult, image)}
                    className="flex-1 bg-secondary hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {mode === 'track' ? 'Confirmar e Adicionar' : 'Salvar Análise'}
                  </button>
                  
                  <button 
                    onClick={handleReanalyze}
                    className="flex-1 bg-surfaceHighlight hover:bg-white/10 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border border-white/5"
                  >
                    <RefreshCw size={18} />
                    Refazer Análise
                  </button>

                  <button 
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-700 text-textMuted rounded-xl hover:text-white hover:border-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
