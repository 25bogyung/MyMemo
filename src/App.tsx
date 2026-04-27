import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  Hash, 
  LayoutGrid,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

// --- Seed Data ---
const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시스템의 컬러 가이드와 그리드 시스템을 준수하여 작업해야 합니다. 폰트 크기는 최소 12px 이상으로 유지하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴\n4. 함께 자라기",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "배달 앱과 중고 마켓을 결합한 지역 기반 서비스 기획. 수익 모델은 수수료와 지역 광고.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_DATA;
      }
    }
    return SEED_DATA;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Note Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // --- Derived State ---
  const allTags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagsMap).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, selectedTag]);

  // --- Handlers ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: title.trim() || "제목 없음",
      body: body.trim(),
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t !== ""),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
    closeModal();
  };

  const handleDeleteNote = (id: number) => {
    if (window.confirm("정말 이 메모를 삭제하시겠습니까?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setBody("");
    setTagsInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setSelectedTag(null); setSearchQuery(""); }}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-100 shadow-lg group-hover:scale-105 transition-transform">
            <ClipboardList size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            MyMemo
          </h1>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="제목, 내용, 태그로 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button 
          onClick={openModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">새 메모</span>
        </button>
      </header>

      <div className="flex max-w-[1600px] mx-auto px-6 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
                <LayoutGrid size={14} />
                필터링
              </h2>
              <button 
                onClick={() => setSelectedTag(null)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group ${!selectedTag ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${!selectedTag ? 'bg-indigo-100' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                    <LayoutGrid size={16} />
                  </div>
                  전체 메모
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedTag ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
                  {notes.length}
                </span>
              </button>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
                <TagIcon size={14} />
                내 태그
              </h2>
              <div className="space-y-1">
                {allTags.map(([tag, count]) => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group ${selectedTag === tag ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Hash size={16} className={selectedTag === tag ? 'text-indigo-400' : 'text-slate-300'} />
                      <span className="truncate">{tag}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${selectedTag === tag ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                ))}
                {allTags.length === 0 && (
                  <p className="text-xs text-slate-400 px-3 italic">태그가 없습니다.</p>
                )}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedTag ? `#${selectedTag}` : '최근 메모'}
              <span className="ml-3 text-sm font-normal text-slate-400">
                총 {filteredNotes.length}개
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div 
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all relative overflow-hidden h-[240px]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {note.title}
                    </h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 flex-1 whitespace-pre-wrap mb-4">
                    {note.body}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 mt-auto">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-slate-400 font-medium">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <ClipboardList size={64} className="mb-4 opacity-20" />
              <p className="text-lg">일치하는 메모가 없습니다.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                className="mt-4 text-indigo-600 hover:underline font-medium"
              >
                검색 필터 초기화
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-bold text-lg text-slate-700">새 메모 추가</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">제목</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="제목을 입력하세요 (필수 아님)"
                    className="w-full px-4 py-3 bg-slate-50 border-transparent border-2 focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all text-lg font-bold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">내용</label>
                  <textarea 
                    placeholder="생각을 기록하세요..."
                    className="w-full flex-1 px-4 py-3 bg-slate-50 border-transparent border-2 focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all resize-none min-h-[200px]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <TagIcon size={12} />
                    태그
                  </label>
                  <input 
                    type="text" 
                    placeholder="태그를 쉼표(,)로 구분하여 입력 (예: 디자인, 업무, 아이디어)"
                    className="w-full px-4 py-3 bg-slate-50 border-transparent border-2 focus:bg-white focus:border-indigo-500 rounded-2xl outline-none transition-all text-sm"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 px-6 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    메모 저장하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
