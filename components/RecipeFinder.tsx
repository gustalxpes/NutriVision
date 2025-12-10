
import React, { useState } from 'react';
import { Search, ChefHat, Clock, Gauge, Loader2, X, List, Flame, Heart, Trash2, PlusCircle } from 'lucide-react';
import { findFitnessRecipes } from '../services/geminiService';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onToggleSave?: (recipe: Recipe) => void;
  onAddToDiet?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

interface RecipeFinderProps {
  onSaveRecipe: (recipe: Recipe) => void;
  onAddToDiet: (recipe: Recipe) => void;
  savedRecipes: Recipe[];
}

// Modal component for detailed recipe view
export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, onToggleSave, onAddToDiet, isSaved = false }) => {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative max-h-[80vh] flex flex-col"
      >
        {/* Fixed Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-surfaceHighlight/30 shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{recipe.name}</h2>
            <div className="flex flex-wrap gap-3 text-xs text-textMuted">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-primary" />
                {recipe.timeToCook}
              </div>
              <div className="flex items-center gap-1">
                <Gauge size={14} className="text-secondary" />
                {recipe.difficulty}
              </div>
              <div className="flex items-center gap-1">
                <Flame size={14} className="text-orange-500" />
                {recipe.calories} kcal
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
                <div className="text-emerald-400 font-bold text-lg">{recipe.protein}g</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Prot</div>
             </div>
             <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
                <div className="text-blue-400 font-bold text-lg">{recipe.carbs}g</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Carb</div>
             </div>
             <div className="bg-surfaceHighlight p-3 rounded-xl text-center border border-white/5">
                <div className="text-yellow-400 font-bold text-lg">{recipe.fat}g</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Gord</div>
             </div>
          </div>

          <div className="space-y-6">
            {/* Ingredients */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                <ChefHat size={16} className="text-primary" /> Ingredientes
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0"></span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                <List size={16} className="text-secondary" /> Modo de Preparo
              </h3>
              <ol className="space-y-3">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-surfaceHighlight text-white rounded-full flex items-center justify-center font-bold text-[10px] border border-white/10">
                        {i + 1}
                      </span>
                      <p className="text-gray-300 mt-0.5 leading-relaxed">{step}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-textMuted italic text-sm">Instruções detalhadas não disponíveis.</p>
                )}
              </ol>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        {(onToggleSave || onAddToDiet) && (
          <div className="p-4 border-t border-white/10 bg-surfaceHighlight/10 flex flex-col sm:flex-row justify-end gap-2 shrink-0">
             {onToggleSave && (
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(recipe);
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
                    isSaved 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                      : 'bg-surfaceHighlight hover:bg-white/10 text-white border border-white/10'
                  }`}
               >
                  {isSaved ? (
                    <>
                      <Trash2 size={16} /> Remover
                    </>
                  ) : (
                    <>
                      <Heart size={16} /> Salvar
                    </>
                  )}
               </button>
             )}
             
             {onAddToDiet && (
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToDiet(recipe);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-primary hover:bg-primaryHover text-white shadow-lg shadow-emerald-900/20 transition-all"
               >
                  <PlusCircle size={16} /> Add à Dieta
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export const RecipeFinder: React.FC<RecipeFinderProps> = ({ onSaveRecipe, onAddToDiet, savedRecipes }) => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setRecipes([]);
    try {
      const results = await findFitnessRecipes(query);
      setRecipes(results);
    } catch (error) {
      console.error("Falha ao encontrar receitas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(ingredients);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // Impede o comportamento padrão para gerenciar o estado manualmente e buscar
    const pastedText = e.clipboardData.getData('text');
    const input = e.currentTarget;
    
    // Obtém a posição do cursor para inserir o texto colado corretamente
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    
    const newValue = 
      ingredients.substring(0, start) + 
      pastedText + 
      ingredients.substring(end);

    setIngredients(newValue);
    performSearch(newValue);
  };

  const isRecipeSaved = (recipe: Recipe) => {
    return savedRecipes.some(r => r.name === recipe.name);
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.32))]">
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {selectedRecipe && (
          <RecipeDetailModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
            onToggleSave={onSaveRecipe}
            onAddToDiet={onAddToDiet}
            isSaved={isRecipeSaved(selectedRecipe)}
          />
        )}

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-white">Assistente de Cozinha Inteligente</h2>
          <p className="text-textMuted">Digite os ingredientes que você tem e a IA sugerirá receitas fitness saudáveis.</p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onPaste={handlePaste}
            placeholder="ex: frango, espinafre, batata doce..."
            className="w-full bg-surface border border-gray-700 text-white pl-5 pr-14 py-4 rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-lg"
          />
          <button 
            type="submit" 
            disabled={loading || !ingredients.trim()}
            className="absolute right-2 top-2 h-10 w-10 bg-primary hover:bg-primaryHover text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {recipes.map((recipe, index) => {
            const saved = isRecipeSaved(recipe);
            return (
              <div 
                key={index} 
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 group cursor-pointer relative"
              >
                {/* Saved Badge */}
                {saved && (
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-white p-1.5 rounded-full shadow-lg z-10">
                    <Heart size={14} fill="white" />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 pr-6">{recipe.name}</h3>
                  </div>
                  
                  <p className="text-textMuted text-sm line-clamp-3">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-textMuted py-2 border-t border-white/5 border-b">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-primary" />
                      {recipe.timeToCook}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge size={14} className="text-secondary" />
                      {recipe.difficulty}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={14} className="text-accent" />
                      {recipe.calories}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                     <div className="bg-surfaceHighlight rounded p-1">
                       <div className="text-emerald-400 font-bold">{recipe.protein}g</div>
                       <div className="text-xs text-textMuted">Prot</div>
                     </div>
                     <div className="bg-surfaceHighlight rounded p-1">
                       <div className="text-blue-400 font-bold">{recipe.carbs}g</div>
                       <div className="text-xs text-textMuted">Carbs</div>
                     </div>
                     <div className="bg-surfaceHighlight rounded p-1">
                       <div className="text-yellow-400 font-bold">{recipe.fat}g</div>
                       <div className="text-xs text-textMuted">Gord</div>
                     </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-textMuted mb-2 font-semibold">Ingredientes principais:</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients.slice(0, 3).map((ing, i) => (
                        <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{ing}</span>
                      ))}
                      {recipe.ingredients.length > 3 && <span className="text-[10px] text-gray-500">+{recipe.ingredients.length - 3}</span>}
                    </div>
                    <div className="mt-3 text-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver detalhes
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!loading && recipes.length === 0 && ingredients && (
           <div className="text-center text-textMuted mt-12">
              Nenhuma receita encontrada. Tente ingredientes diferentes.
           </div>
        )}
      </div>
    </div>
  );
};
