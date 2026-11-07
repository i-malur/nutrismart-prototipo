import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Clock, 
  ArrowRight,
  Zap,
  TrendingUp,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Challenge, RewardCoupon, UserProfile } from '../types';

interface ChallengesViewProps {
  challenges: Challenge[];
  rewards: RewardCoupon[];
  user: UserProfile;
  onUpdateChallengeProgress: (challengeId: string) => void;
  onClaimReward: (rewardId: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  rewards,
  user,
  onUpdateChallengeProgress,
  onClaimReward,
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'rewards'>('challenges');
  const [claimedRewardCode, setClaimedRewardCode] = useState<{ name: string; code: string } | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#63D753', '#D0F4A4', '#0C6816', '#EFE6D1']
    });
  };

  const handleProgress = (challengeId: string) => {
    onUpdateChallengeProgress(challengeId);
    triggerConfetti();
  };

  const handleClaim = (reward: RewardCoupon) => {
    if (user.points < reward.pointsCost) return;
    onClaimReward(reward.id);
    triggerConfetti();
    setClaimedRewardCode({
      name: reward.title,
      code: reward.code || `NUTRI-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const leaderboardMock = [
    { rank: 1, name: 'Mariana Costa', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', points: 1420, streak: 18, badge: 'Mestre da Dispensa' },
    { rank: 2, name: 'Lucas Ferreira', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', points: 1250, streak: 14, badge: 'Eco Chef Ouro' },
    { rank: 3, name: 'Camila Rocha', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', points: 1100, streak: 11, badge: 'Guardião Verde' },
    { rank: 4, name: `${user.name} (Você)`, avatar: user.avatar, points: user.points, streak: user.streakDays, badge: user.levelTitle, isMe: true },
    { rank: 5, name: 'Rodrigo Gomes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', points: 740, streak: 6, badge: 'Explorador Culinário' },
  ];

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Gamificação & Hábitos Saudáveis</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Desafios & Prêmios NutriSmart
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Participe de desafios propostos pelo aplicativo, acumule pontos por manter sua dispensa sem desperdício e refeições balanceadas, e resgate prêmios exclusivos!
            </p>
          </div>

          {/* User Points Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#63D753] text-[#0C6816] flex items-center justify-center font-black text-2xl shadow-md">
              ⚡
            </div>
            <div>
              <span className="text-xs text-[#D0F4A4] font-semibold block">Seu Saldo de Pontos</span>
              <p className="font-display font-black text-2xl sm:text-3xl text-white">{user.points} <span className="text-xs font-normal text-white/80">pts</span></p>
              <span className="text-[11px] text-white/90">Ofensiva: 🔥 {user.streakDays} dias seguidos</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/15">
          <button
            onClick={() => setActiveTab('challenges')}
            id="tab-challenges"
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-[#63D753] text-[#0C6816] shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Desafios Ativos ({challenges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            id="tab-leaderboard"
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-[#63D753] text-[#0C6816] shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranking & Competições</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            id="tab-rewards"
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rewards'
                ? 'bg-[#63D753] text-[#0C6816] shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Loja de Prêmios & Cupons</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Active Challenges */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => {
            const isCompleted = ch.progress >= ch.target;
            const percent = Math.min(100, Math.round((ch.progress / ch.target) * 100));

            return (
              <div
                key={ch.id}
                id={`challenge-card-${ch.id}`}
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
                  isCompleted ? 'border-[#63D753] bg-emerald-50/20' : 'border-[#EFE6D1] hover:border-[#63D753]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF7EE] border border-[#EFE6D1] text-2xl flex items-center justify-center">
                        {ch.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-[#FAF7EE] text-[#0C6816] px-2 py-0.5 rounded-md border border-[#EFE6D1]">
                            {ch.category}
                          </span>
                          <span className="text-[10px] text-[#5E6B52] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ch.daysRemaining} dias restantes
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-[#0C6816] mt-1">
                          {ch.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-[#0C6816] bg-[#D0F4A4] px-2.5 py-1 rounded-lg">
                        +{ch.pointsReward} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5E6B52] mt-3 leading-relaxed">
                    {ch.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0C6816]">
                      <span>Progresso: {ch.progress} / {ch.target}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF7EE] rounded-full overflow-hidden border border-[#EFE6D1]">
                      <div
                        className="h-full bg-[#63D753] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5E6B52]">
                    {isCompleted ? '🎉 Desafio Concluído!' : 'Registre sua ação diária'}
                  </span>

                  <button
                    onClick={() => handleProgress(ch.id)}
                    disabled={isCompleted}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-[#EFE6D1] text-[#5E6B52] cursor-not-allowed'
                        : 'bg-[#0C6816] hover:bg-[#095011] text-white shadow-md active:scale-95'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#0C6816]" />
                        <span>Resgatado</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-[#D0F4A4]" />
                        <span>Registrar Progresso Hoje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white border border-[#EFE6D1] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE6D1]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#0C6816]">Ranking da Comunidade Saudável</h3>
              <p className="text-xs text-[#5E6B52]">Disputa semanal baseada em pontuação de receitas aproveitadas e hábitos consistentes</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#FAF7EE] px-3 py-1.5 rounded-xl border border-[#EFE6D1] text-xs font-bold text-[#0C6816]">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Temporada Agosto/2026</span>
            </div>
          </div>

          <div className="space-y-3">
            {leaderboardMock.map((item) => (
              <div
                key={item.rank}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  item.isMe
                    ? 'bg-[#D0F4A4]/40 border-2 border-[#63D753] shadow-xs'
                    : 'bg-white border-[#EFE6D1]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm ${
                    item.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                    item.rank === 2 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                    item.rank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    'bg-[#FAF7EE] text-[#5E6B52]'
                  }`}>
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                  </span>

                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#63D753]"
                  />

                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0C6816]">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-[#5E6B52] font-medium">
                      {item.badge} • 🔥 {item.streak} dias
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display font-black text-base text-[#0C6816] block">
                    {item.points} pts
                  </span>
                  <span className="text-[10px] text-[#63D753] font-bold flex items-center justify-end gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +120 esta semana
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Rewards Store */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((rew) => {
              const canAfford = user.points >= rew.pointsCost;

              return (
                <div
                  key={rew.id}
                  id={`reward-card-${rew.id}`}
                  className="bg-white rounded-2xl p-6 border border-[#EFE6D1] hover:border-[#63D753] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl bg-[#FAF7EE] p-2 rounded-xl border border-[#EFE6D1]">
                        {rew.icon}
                      </span>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        canAfford ? 'bg-[#D0F4A4] text-[#0C6816]' : 'bg-[#FAF7EE] text-[#5E6B52]'
                      }`}>
                        {rew.pointsCost} Pontos
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-[#0C6816] mt-3 leading-snug">
                      {rew.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#63D753] mt-0.5">{rew.sponsor}</p>

                    <p className="text-xs text-[#5E6B52] mt-2 leading-relaxed">
                      {rew.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE6D1]">
                    <button
                      onClick={() => handleClaim(rew)}
                      disabled={!canAfford || rew.isClaimed}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        rew.isClaimed
                          ? 'bg-[#FAF7EE] text-[#0C6816] border border-[#63D753]'
                          : canAfford
                            ? 'bg-[#0C6816] hover:bg-[#095011] text-white shadow-md active:scale-95'
                            : 'bg-[#FAF7EE] text-[#5E6B52] border border-[#EFE6D1] cursor-not-allowed'
                      }`}
                    >
                      {rew.isClaimed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#63D753]" />
                          <span>Cupom Já Resgatado</span>
                        </>
                      ) : canAfford ? (
                        <>
                          <Gift className="w-4 h-4 text-[#D0F4A4]" />
                          <span>Resgatar Prêmio</span>
                        </>
                      ) : (
                        <span>Faltam {rew.pointsCost - user.points} pontos</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claimed Coupon Voucher Modal */}
      {claimedRewardCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#EFE6D1] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#D0F4A4] text-[#0C6816] mx-auto flex items-center justify-center text-3xl">
              🎁
            </div>
            
            <div>
              <span className="text-xs font-bold text-[#63D753] uppercase">Prêmio Desbloqueado!</span>
              <h3 className="font-display font-bold text-lg text-[#0C6816] mt-1">{claimedRewardCode.name}</h3>
              <p className="text-xs text-[#5E6B52] mt-1">Utilize o código promocional abaixo no checkout do parceiro:</p>
            </div>

            <div className="bg-[#FAF7EE] border-2 border-dashed border-[#63D753] p-3.5 rounded-xl">
              <span className="font-mono font-black text-xl text-[#0C6816] tracking-widest">
                {claimedRewardCode.code}
              </span>
            </div>

            <button
              onClick={() => setClaimedRewardCode(null)}
              className="w-full bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              Copiar e Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
