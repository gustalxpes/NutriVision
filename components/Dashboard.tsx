
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, Zap, Droplet, Plus, Clock, ArrowUpRight } from 'lucide-react';
import { MacroGoals, Meal } from '../types';

interface DashboardProps {
  goals: MacroGoals;
  meals: Meal[];
  onAddMeal: () => void;
  onMealClick: (meal: Meal) => void;
}

const StatCard: React.FC<{ 
  title: string; 
  current: number; 
  target: number; 
  unit: string; 
  icon: React.ReactNode; 
  color: string;
}> = ({ title, current, target, unit, icon, color }) => {
  const rawPercentage = Math.round((current / target) * 100);
  const isOver = current > target;
  
  // Se passou da meta, usa vermelho. Se não, usa a cor definida.
  const displayColor = isOver ? 'red' : color;
  
  // Para a barra de progresso visual, limitamos a 100%
  const progressWidth = Math.min(100, rawPercentage);
  
  return (
    <div className={`bg-surface p-5 rounded-2xl border ${isOver ? 'border-red-500/50' : 'border-white/5'} shadow-lg relative overflow-hidden group transition-all duration-300`}>
      <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity text-${displayColor}-400`}>
        {icon}
      </div>
      <h3 className="text-textMuted text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-2xl font-bold ${isOver ? 'text-red-500' : 'text-white'}`}>{current}</span>
        <span className="text-xs text-textMuted mb-1">/ {target} {unit}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-${displayColor}-500`}
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>
      <div className="mt-2 text-right">
        <span className={`text-xs font-semibold text-${displayColor}-400`}>
          {rawPercentage}% {isOver && '(Excedido)'}
        </span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ goals, meals, onAddMeal, onMealClick }) => {
  const [chartPeriod, setChartPeriod] = useState<'days' | 'weeks'>('days');

  // Calculate daily totals for today
  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = meals.filter(m => m.timestamp.startsWith(today));

  const totals = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Generate Chart Data based on period
  const chartData = useMemo(() => {
    if (chartPeriod === 'days') {
      // Last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Find meals for this day
        const dayCalories = meals
          .filter(m => m.timestamp.startsWith(dateStr))
          .reduce((sum, m) => sum + m.calories, 0);

        const dayName = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        
        data.push({
          name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          cal: dayCalories,
          fullDate: dateStr
        });
      }
      return data;
    } else {
      // Weeks (Mock logic for demonstration since we don't have months of data)
      // In a real app, this would aggregate `meals` by week number.
      return [
        { name: 'Semana 1', cal: 14500 }, // Mock average
        { name: 'Semana 2', cal: 15200 },
        { name: 'Semana 3', cal: 13800 },
        { name: 'Atual', cal: totals.calories + 10500 }, // Current + hypothetical previous days
      ];
    }
  }, [chartPeriod, meals, totals.calories]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Olá, Usuário 👋</h1>
          <p className="text-textMuted">Vamos manter sua nutrição em dia hoje.</p>
        </div>
        <button 
          onClick={onAddMeal}
          className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={20} />
          Adicionar Refeição
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Calorias" 
          current={totals.calories} 
          target={goals.calories} 
          unit="kcal" 
          icon={<Flame size={32} />} 
          color="orange" // tailwind color name part
        />
        <StatCard 
          title="Proteínas" 
          current={totals.protein} 
          target={goals.protein} 
          unit="g" 
          icon={<Zap size={32} />} 
          color="emerald"
        />
        <StatCard 
          title="Carboidratos" 
          current={totals.carbs} 
          target={goals.carbs} 
          unit="g" 
          icon={<Activity size={32} />} 
          color="blue"
        />
        <StatCard 
          title="Gorduras" 
          current={totals.fat} 
          target={goals.fat} 
          unit="g" 
          icon={<Droplet size={32} />} 
          color="yellow"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Estatísticas de Calorias</h2>
            <div className="flex bg-surfaceHighlight rounded-lg p-1">
              <button 
                onClick={() => setChartPeriod('days')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  chartPeriod === 'days' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Dias
              </button>
              <button 
                onClick={() => setChartPeriod('weeks')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  chartPeriod === 'weeks' 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Semanas
              </button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A2E26', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cal" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Meals Section */}
        <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Refeições de Hoje</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[300px]">
            {todaysMeals.length === 0 ? (
              <div className="text-center text-textMuted py-8">
                Nenhuma refeição registrada hoje.
              </div>
            ) : (
              todaysMeals.slice().reverse().map((meal) => (
                <div 
                  key={meal.id} 
                  onClick={() => onMealClick(meal)}
                  className="bg-surfaceHighlight p-4 rounded-xl flex items-center gap-3 group hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                     {meal.imageUrl ? (
                       <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">?</div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate group-hover:text-primary transition-colors">{meal.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <Clock size={12} />
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-secondary font-bold text-sm">{meal.calories}</div>
                    <div className="text-[10px] text-textMuted">kcal</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {todaysMeals.length > 0 && (
            <button onClick={onAddMeal} className="mt-4 w-full py-3 rounded-xl border border-dashed border-gray-700 text-textMuted hover:text-white hover:border-gray-500 transition-colors flex justify-center items-center gap-2 text-sm">
              <Plus size={16} /> Adicionar Outra
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
