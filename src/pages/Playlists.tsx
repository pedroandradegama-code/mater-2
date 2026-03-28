import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Music } from 'lucide-react';

// ─── DADOS DE CURADORIA ───────────────────────────────────────────────────────
const MOODS = [
  {
    id: 'calma',
    label: 'Calma',
    emoji: '🌿',
    desc: 'Para relaxar e respirar fundo',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    inactive: 'bg-card text-muted-foreground border-[var(--card-border-color)]',
    playlists: [
      { id: 'calma-1', title: 'Música para Relaxar', desc: 'Sons suaves para acalmar a mente', spotifyId: '37i9dQZF1DX3Ogs1Pb7K78' },
      { id: 'calma-2', title: 'Baby Sleep Music', desc: 'Melodias suaves para mãe e bebê', spotifyId: '37i9dQZF1DWZd79rJ6a7lp' },
      { id: 'calma-3', title: 'Peaceful Piano', desc: 'Piano instrumental acolhedor', spotifyId: '37i9dQZF1DX4sWSpwq3LiO' },
    ],
  },
  {
    id: 'animada',
    label: 'Animada',
    emoji: '✨',
    desc: 'Para os dias de energia boa',
    bg: 'from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    active: 'bg-amber-100 text-amber-800 border-amber-300',
    inactive: 'bg-card text-muted-foreground border-[var(--card-border-color)]',
    playlists: [
      { id: 'animada-1', title: 'Boas Energias', desc: 'Músicas que elevam o astral', spotifyId: '37i9dQZF1DX9wC1KY45plY' },
      { id: 'animada-2', title: 'Happy Hits Brasil', desc: 'Pop brasileiro animado', spotifyId: '37i9dQZF1DXdxcBWuJkbcy' },
      { id: 'animada-3', title: 'Feel Good Friday', desc: 'Para dançar com o barrigão', spotifyId: '37i9dQZF1DX2sUQwD7tbmL' },
    ],
  },
  {
    id: 'nostalgica',
    label: 'Nostálgica',
    emoji: '🌅',
    desc: 'Para refletir e se emocionar',
    bg: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    active: 'bg-rose-100 text-rose-800 border-rose-300',
    inactive: 'bg-card text-muted-foreground border-[var(--card-border-color)]',
    playlists: [
      { id: 'nostalgica-1', title: 'MPB Clássica', desc: 'Grandes canções brasileiras', spotifyId: '37i9dQZF1DX8FwnYE6PRvL' },
      { id: 'nostalgica-2', title: 'All Out 90s Brasil', desc: 'As músicas que marcaram uma geração', spotifyId: '37i9dQZF1DXa2PvUpywmrr' },
      { id: 'nostalgica-3', title: 'Clássicos do Romance', desc: 'Para se emocionar com leveza', spotifyId: '37i9dQZF1DX50QitC6Oqtn' },
    ],
  },
  {
    id: 'meditativa',
    label: 'Meditativa',
    emoji: '🧘',
    desc: 'Para meditar e conectar com o bebê',
    bg: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    active: 'bg-violet-100 text-violet-800 border-violet-300',
    inactive: 'bg-card text-muted-foreground border-[var(--card-border-color)]',
    playlists: [
      { id: 'meditativa-1', title: 'Meditação e Mindfulness', desc: 'Sons para presença e calma profunda', spotifyId: '37i9dQZF1DX9uKNf5jGX6m' },
      { id: 'meditativa-2', title: 'Nature Sounds', desc: 'Sons da natureza para relaxar', spotifyId: '37i9dQZF1DX4PP3DA4J0N8' },
      { id: 'meditativa-3', title: 'Yoga & Meditation', desc: 'Para respiração e conexão', spotifyId: '37i9dQZF1DX9uKNf5jGX6m' },
    ],
  },
  {
    id: 'bebe',
    label: 'Para o bebê',
    emoji: '👶',
    desc: 'Músicas para estimular o pequeno',
    bg: 'from-sky-50 to-blue-50',
    border: 'border-sky-200',
    active: 'bg-sky-100 text-sky-800 border-sky-300',
    inactive: 'bg-card text-muted-foreground border-[var(--card-border-color)]',
    playlists: [
      { id: 'bebe-1', title: 'Canções de Ninar', desc: 'Clássicas para adormecer', spotifyId: '37i9dQZF1DX5q67ZpuYaMf' },
      { id: 'bebe-2', title: 'Mozart for Babies', desc: 'Clássicos para estimulação', spotifyId: '37i9dQZF1DX4UtSsGT1Sbe' },
      { id: 'bebe-3', title: 'Músicas Infantis Brasil', desc: 'As favoritas da criançada', spotifyId: '37i9dQZF1DX9sQDbOMReFI' },
    ],
  },
];

export default function Playlists() {
  const navigate = useNavigate();
  const [moodAtivo, setMoodAtivo] = useState(MOODS[0].id);
  const [playlistAtiva, setPlaylistAtiva] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mood = MOODS.find(m => m.id === moodAtivo) || MOODS[0];
  const playlist = mood.playlists.find(p => p.id === playlistAtiva) || null;

  useEffect(() => {
    setPlaylistAtiva(null);
  }, [moodAtivo]);

  const handlePlaylistClick = (playlistId: string) => {
    setPlaylistAtiva(playlistAtiva === playlistId ? null : playlistId);
  };

  return (
    <div className="dashboard-bg min-h-screen pb-24">
      <div className="app-container px-5 pt-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card border border-[var(--card-border-color)] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Playlists</h1>
            <p className="text-xs text-muted-foreground">Curadas para cada momento da gestação</p>
          </div>
        </div>

        {/* SELETOR DE MOOD */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Como você está agora?
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMoodAtivo(m.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-sm font-medium transition-all card-press ${
                  moodAtivo === m.id ? m.active : m.inactive
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CARD DO MOOD ATIVO */}
        <div className={`bg-gradient-to-br ${mood.bg} rounded-[20px] border ${mood.border} p-4 mb-5`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{mood.emoji}</span>
            <p className="font-display text-lg font-semibold text-foreground">{mood.label}</p>
          </div>
          <p className="text-sm text-muted-foreground">{mood.desc}</p>
        </div>

        {/* PLAYER EMBED */}
        {playlist && (
          <div className="mb-5 animate-fade-in">
            <iframe
              ref={iframeRef}
              key={playlist.spotifyId}
              src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              style={{ borderRadius: '16px', border: 'none' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={playlist.title}
            />
          </div>
        )}

        {/* LISTA DE PLAYLISTS */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Playlists para esse momento
          </p>
          <div className="space-y-2.5">
            {mood.playlists.map(pl => {
              const isAtiva = playlistAtiva === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => handlePlaylistClick(pl.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all card-press ${
                    isAtiva
                      ? `${mood.active} border-2`
                      : 'bg-card border-[var(--card-border-color)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isAtiva ? 'bg-white/50' : 'bg-primary-light'
                  }`}>
                    {isAtiva ? (
                      <span className="text-lg">▶</span>
                    ) : (
                      <Music size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isAtiva ? '' : 'text-foreground'}`}>{pl.title}</p>
                    <p className={`text-xs truncate ${isAtiva ? 'opacity-70' : 'text-muted-foreground'}`}>{pl.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NOTA */}
        <div className="mt-6 bg-card rounded-[16px] border border-[var(--card-border-color)] px-4 py-3 flex items-start gap-2.5">
          <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            As playlists são reproduzidas via Spotify. Usuários com conta Premium têm acesso completo às músicas. Sem conta, é possível ouvir prévias de 30 segundos.
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
