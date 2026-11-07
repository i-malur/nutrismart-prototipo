import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  Sparkles, 
  Plus, 
  Tag,
  Award
} from 'lucide-react';
import { CommunityPost, UserProfile } from '../types';

interface CommunityViewProps {
  posts: CommunityPost[];
  user: UserProfile;
  onAddPost: (post: Omit<CommunityPost, 'id' | 'timeAgo' | 'likesCount' | 'hasLiked' | 'comments'>) => void;
  onLikePost: (postId: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  user,
  onAddPost,
  onLikePost,
}) => {
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postRecipeTitle, setPostRecipeTitle] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postTag, setPostTag] = useState('ZeroDesperdício');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    onAddPost({
      authorName: user.name,
      authorAvatar: user.avatar,
      authorBadge: user.levelTitle,
      content: postContent.trim(),
      recipeTitle: postRecipeTitle.trim() || undefined,
      imageUrl: postImageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      tags: [postTag, 'NutriSmartComunidade']
    });

    setPostContent('');
    setPostRecipeTitle('');
    setPostImageUrl('');
    setIsNewPostModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0C6816] via-[#147a22] to-[#0C6816] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0F4A4]/20 border border-[#D0F4A4]/30 text-[#D0F4A4] text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Troca de Experiências & Pratos Saudáveis</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Comunidade NutriSmart
            </h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Compartilhe suas criações gastronômicas com ingredientes da dispensa, tire dúvidas com outros membros e acompanhe dicas exclusivas dos nossos nutricionistas parceiros.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              id="community-new-post-btn"
              className="flex items-center gap-2 bg-[#63D753] hover:bg-[#52c244] text-[#0C6816] font-extrabold px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publicar Experiência</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              id={`community-post-${post.id}`}
              className="bg-white border border-[#EFE6D1] rounded-2xl overflow-hidden shadow-2xs space-y-4 p-5 sm:p-6"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#63D753]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-[#0C6816]">{post.authorName}</h4>
                      {post.authorBadge && (
                        <span className="text-[10px] font-bold bg-[#FAF7EE] text-[#0C6816] px-2 py-0.2 rounded-md border border-[#EFE6D1]">
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E6B52]">{post.timeAgo}</p>
                  </div>
                </div>
              </div>

              {/* Content text */}
              <p className="text-sm text-[#1F2E1E] leading-relaxed">
                {post.content}
              </p>

              {/* Recipe Badge Tag if referenced */}
              {post.recipeTitle && (
                <div className="inline-flex items-center gap-1.5 bg-[#FAF7EE] border border-[#EFE6D1] px-3 py-1.5 rounded-xl text-xs font-bold text-[#0C6816]">
                  <span>🍳 Receita:</span>
                  <span>{post.recipeTitle}</span>
                </div>
              )}

              {/* Attached Photo with error fallback */}
              {post.imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-80 bg-[#FAF7EE] border border-[#EFE6D1]">
                  <img
                    src={post.imageUrl}
                    alt="Foto do prato ou conquista"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a guaranteed high-reliability food image if original fails
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((t, idx) => (
                  <span key={idx} className="text-[11px] font-medium text-[#0C6816] bg-[#FAF7EE] px-2 py-0.5 rounded-md border border-[#EFE6D1]">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Likes Action Bar Only */}
              <div className="pt-3 border-t border-[#EFE6D1] flex items-center justify-between text-xs text-[#5E6B52]">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer px-3 py-1.5 rounded-xl border ${
                    post.hasLiked 
                      ? 'text-rose-600 bg-rose-50 border-rose-200 shadow-2xs' 
                      : 'hover:text-[#0C6816] hover:bg-[#FAF7EE] border-transparent'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.likesCount} Curtidas</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Sidebar Column (Community Highlights & Rules) */}
        <div className="space-y-6">
          
          {/* Daily Topic / Nutritionist Spotlight */}
          <div className="bg-white border border-[#EFE6D1] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#0C6816]">
              <Sparkles className="w-4 h-4 text-[#63D753]" />
              <h3 className="font-display font-bold text-sm">Destaque da Semana</h3>
            </div>

            <div className="bg-[#FAF7EE] p-3.5 rounded-xl border border-[#EFE6D1] space-y-2">
              <p className="text-xs font-bold text-[#0C6816]">🌱 Desperdício Zero na Prática</p>
              <p className="text-xs text-[#5E6B52] leading-relaxed">
                "Talos de brócolis, espinafre e couve possuem até 40% mais fibras e cálcio que as folhas. Experimente refogá-los em cubinhos com alho e azeite!"
              </p>
              <p className="text-[10px] text-[#0C6816] font-bold text-right">— Dra. Beatriz Albuquerque (CRN-3)</p>
            </div>
          </div>

          {/* Popular Community Tags */}
          <div className="bg-white border border-[#EFE6D1] rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-display font-bold text-sm text-[#0C6816]">Tópicos em Alta</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'ZeroDesperdício',
                'DesafioNutriSmart',
                'MealPrepDomingo',
                'ReceitaEm15Min',
                'LowCarbBrasil',
                'DicaDeNutri',
                'HortaCaseira'
              ].map(tag => (
                <span key={tag} className="text-xs font-semibold bg-[#FAF7EE] hover:bg-[#EFE6D1] text-[#0C6816] px-2.5 py-1 rounded-lg border border-[#EFE6D1] cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* New Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EFE6D1] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6D1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D0F4A4] flex items-center justify-center text-[#0C6816]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#0C6816]">Compartilhar na Comunidade</h3>
              </div>
              <button 
                onClick={() => setIsNewPostModalOpen(false)}
                className="text-[#5E6B52] hover:text-[#0C6816] font-bold text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF7EE]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Sua Experiência ou Dica *</label>
                <textarea
                  rows={4}
                  required
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Conte o que preparou hoje, como economizou na dispensa ou compartilhe sua conquista saudável..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-sm text-[#0C6816] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Receita Associada (Opcional)</label>
                <input
                  type="text"
                  value={postRecipeTitle}
                  onChange={(e) => setPostRecipeTitle(e.target.value)}
                  placeholder="Ex: Frittata Rústica de Espinafre com Ovos"
                  className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#0C6816] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">URL da Foto do Prato (Opcional)</label>
                <input
                  type="url"
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto-do-prato.jpg"
                  className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#0C6816] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C6816] mb-1">Tag Principal</label>
                <select
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7EE] border border-[#EFE6D1] focus:border-[#63D753] rounded-xl text-xs text-[#0C6816] outline-hidden cursor-pointer"
                >
                  <option value="ZeroDesperdício">#ZeroDesperdício</option>
                  <option value="JantarRápido">#JantarRápido</option>
                  <option value="DesafioNutriSmart">#DesafioNutriSmart</option>
                  <option value="MealPrep">#MealPrep</option>
                  <option value="LowCarb">#LowCarb</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5E6B52] hover:text-[#0C6816] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0C6816] hover:bg-[#095011] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Publicar no Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
