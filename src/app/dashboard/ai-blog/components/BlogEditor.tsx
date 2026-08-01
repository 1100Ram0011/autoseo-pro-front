// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const AdminModal = ({ isOpen, onClose, onConfirm }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
        <h3>Delete this blog?</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} style={{ background: 'red', color: 'white' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};
const TemplateShareSheet = ({ isOpen, onClose, url }: any) => {
  if (!isOpen) return null;
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}><div style={{ background: 'white', padding: '2rem', margin: '10% auto', width: '300px' }}>Share URL: {url}</div></div>;
};
import {
  usePublishBlogMutation,
  useGetMyBlogsQuery,
  useGetBlogStatusQuery,
  useDeleteBlogMutation,
} from '@/hooks/useAIBlog';
import { Trash2, Eye, Share2, PenLine } from 'lucide-react';

// function StatusPoller({ blogId, onDone }) {
//   const [active, setActive] = useState(true);
//   const { data } = useGetBlogStatusQuery(blogId, {
//     skip: !active,
//     pollingInterval: 3000,
//   });

//   useEffect(() => {
//     const status = data?.blog?.status;
//     if (status === 'published') {
//       toast.success('Blog published on Dev.to!');
//       setActive(false);
//       onDone(data?.blog?.devtoUrl);
//     } else if (status === 'failed') {
//       toast.error('Publish failed: ' + (data?.blog?.errorMessage || 'unknown error'));
//       setActive(false);
//       onDone();
//     }
//   }, [data, onDone]);

//   return null;
// }



function StatusPoller({ blogId, onDone }) {
  const [active, setActive] = useState(true);
  const [processed, setProcessed] = useState(false); // Prevent double-call
  const { data } = useGetBlogStatusQuery(blogId, {
    skip: !active,
    pollingInterval: 2000, // Faster polling
  });

  useEffect(() => {
    if (processed) return; // Already handled

    const status = data?.blog?.status;
    if (status === 'published') {
      toast.success('Blog published successfully!');
      setActive(false);
      setProcessed(true);
      // Fallback for whichever URL is available
      const publishedUrl = data?.blog?.devtoUrl;
      // Delay ensures state update completes
      setTimeout(() => onDone(publishedUrl), 300);
    } else if (status === 'failed') {
      let errMsg = data?.blog?.errorMessage || 'unknown error';
      if (errMsg.includes('You do not have permission') || errMsg.includes('Blogger Profile')) {
        errMsg = 'Blogger Account not set up: Please visit Blogger.com to create your first blog, then try again.';
      } else {
        errMsg = `Publish failed: ${errMsg}`;
      }
      toast.error(errMsg, { duration: 8000 });
      setActive(false);
      setProcessed(true);
      setTimeout(() => onDone(), 300);
    }
  }, [data?.blog?.status, processed, onDone]); // Specific dependencies
}

const BORDER = '0.5px solid color-mix(in srgb, currentColor 15%, transparent)';

export default function BlogEditor({ initialData = {}, onPublished, bloggerStatus }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [tags, setTags] = useState(initialData.tags || '');
  const [content, setContent] = useState(() => {
    if (typeof initialData.content !== 'string') return initialData.content || '';
    return initialData.content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [aiCoverUrl, setAiCoverUrl] = useState(initialData.coverImage || null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['devto', 'blogger']);
  const [pollingIds, setPollingIds] = useState([]);
  const [lastPublishedUrl, setLastPublishedUrl] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const fileRef = useRef();
  const textareaRef = useRef();

  const [publishBlog, { isLoading: isPublishing }] = usePublishBlogMutation();
  const [deleteBlogMutation] = useDeleteBlogMutation();
  const { data: blogsData, refetch } = useGetMyBlogsQuery({ page: 1, limit: 20 });
  const blogs = blogsData?.blogs || [];

  const [deleteData, setDeleteData] = useState({ isOpen: false, id: null });

  const handleDelete = (id) => {
    setDeleteData({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      await deleteBlogMutation(deleteData.id).unwrap();
      toast.success('Blog deleted');
      refetch();
    } catch (err) {
      toast.error('Failed to delete blog');
    } finally {
      setDeleteData({ isOpen: false, id: null });
    }
  };

  const [shareData, setShareData] = useState({ isOpen: false, url: '', title: '' });

  const handleShare = (blog) => {
    const url = blog.devtoUrl || blog.bloggerUrl;
    if (!url) return toast.error('No published link available');
    
    setShareData({ isOpen: true, url, title: blog.title });
  };

  const cleanAIContent = (text) => {
    if (typeof text !== 'string') return text || '';
    return text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
  };

  const handleRevertDraft = (blog) => {
    setTitle(blog.title || '');
    if (blog.content) setContent(cleanAIContent(blog.content));
    if (blog.tags && Array.isArray(blog.tags)) setTags(blog.tags.join(', '));
    
    // Load cover image
    if (blog.coverImage) {
      setAiCoverUrl(blog.coverImage);
    } else {
      setAiCoverUrl(null);
    }
    removeUploadedImage(); // Clear manual uploads just in case
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Blog loaded into editor');
  };

  const checks = {
    title: title.trim().length > 0,
    content: content.trim().length > 50,
    tags: tags.trim().length > 0,
    image: !!coverImage || !!aiCoverUrl,
  };
  const allReady = Object.values(checks).every(Boolean);

  function handleFile(file) {
    if (!file) return;
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function removeUploadedImage() {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeAllImages() {
    removeUploadedImage();
    setAiCoverUrl(null);
  }

  function insertMd(before, after) {
    const ta = textareaRef.current;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = content.substring(s, e);
    setContent(content.substring(0, s) + before + sel + after + content.substring(e));
    setTimeout(() => {
      ta.selectionStart = s + before.length;
      ta.selectionEnd = s + before.length + sel.length;
      ta.focus();
    }, 0);
  }

  async function handlePublish() {
    if (!allReady || isPublishing) return;
    const toastId = toast.loading('Adding to publish queue...');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('tags', tags);
      formData.append('content', content);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      } else if (aiCoverUrl) {
        formData.append('coverImageUrl', aiCoverUrl);
      }
      
      const platformsToSubmit = selectedPlatforms.filter(p => p !== 'blogger' || bloggerStatus?.connected);
      formData.append('platforms', platformsToSubmit.join(','));

      const result = await publishBlog(formData).unwrap();
      toast.success('Queued! Publishing...', { id: toastId });

      if (result?.blog?._id) {
        setPollingIds((prev) => [...prev, result.blog._id]);
      }

      setTitle('');
      setTags('');
      setContent('');
      setShowPublishConfirm(false);
      refetch();
    } catch (err) {
      toast.error('Failed to queue: ' + (err?.data?.message || err.message), { id: toastId });
    }
  }

  function clearAll() {
    setTitle(''); setTags(''); setContent('');
    removeAllImages();
    setLastPublishedUrl(null);
  }

  function togglePlatform(platform) {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl overflow-hidden font-sans w-full" style={{ outline: '1px solid color-mix(in srgb, currentColor 20%, transparent)' }}>

      {/* Status pollers */}
      {/* {pollingIds.map((id) => (
        <StatusPoller
          key={id}
          blogId={id}
          onDone={(publishedUrl) => {
            setPollingIds((prev) => prev.filter((x) => x !== id));
            removeAllImages();
            if (publishedUrl) setLastPublishedUrl(publishedUrl);
            refetch();
          }}
        />
      ))} */}

      {pollingIds.map((id) => (
        <StatusPoller
          key={id}
          blogId={id}
          onDone={(publishedUrl) => {
            setPollingIds((prev) => prev.filter((x) => x !== id));
            removeAllImages();
            if (publishedUrl) setLastPublishedUrl(publishedUrl);
            refetch();
            // Admin auto-queue: parent ko signal karo
            if (onPublished) onPublished();
          }}
        />
      ))}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg w-full max-w-sm">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Publish Blog?</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to publish <strong className="break-words">"{title}"</strong>?
            </p>
            
            {/* Platform Selection */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-semibold">Select Platforms to Publish</label>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={selectedPlatforms.includes('devto')} onChange={() => togglePlatform('devto')} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-gray-900 text-white rounded flex items-center justify-center text-[10px] font-bold">D</span>
                    Dev.to
                  </span>
                </label>
                {bloggerStatus?.connected && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={selectedPlatforms.includes('blogger')} onChange={() => togglePlatform('blogger')} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-orange-500 text-white rounded flex items-center justify-center text-[10px] font-bold">B</span>
                      Blogger
                    </span>
                    <span className="text-xs ml-auto text-right">
                      <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">✓</span>
                    </span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-3 justify-end flex-col-reverse sm:flex-row">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="w-full sm:w-auto px-3 md:px-4 py-2 text-xs md:text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={selectedPlatforms.length === 0}
                className={`w-full sm:w-auto px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white rounded-lg cursor-pointer ${
                  selectedPlatforms.length === 0 
                    ? 'bg-blue-400 opacity-70 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 md:py-2.5 bg-gray-50 dark:bg-gray-800" style={{ borderBottom: BORDER }}>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-[10px] md:text-[11px] px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium bg-green-100 text-green-800 whitespace-nowrap">
            ⬡ dev.to
          </span>
          <span className="text-[10px] md:text-[11px] px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 whitespace-nowrap">draft</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1 px-2 md:px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-lg border cursor-pointer transition-colors ${isPreviewMode
                ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {isPreviewMode ? '✏️ Edit' : '👁 Preview'}
          </button>
          {lastPublishedUrl && (
            <a
              href={lastPublishedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2 md:px-3.5 py-1.5 text-xs md:text-sm font-medium bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 no-underline transition-colors"
            >
              ↗ View
            </a>
          )}
          <button
            onClick={() => allReady && !isPublishing && setShowPublishConfirm(true)}
            disabled={isPublishing || !allReady}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2 md:px-3.5 py-1.5 text-xs md:text-sm font-medium bg-blue-600 text-white border-none rounded-lg cursor-pointer hover:bg-blue-700 transition-opacity ${isPublishing || !allReady ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            <span className="hidden sm:inline">{isPublishing ? 'Queuing...' : '↑ Publish'}</span>
            <span className="sm:hidden">{isPublishing ? '...' : '↑'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-3 md:p-4">
        {isPreviewMode ? (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Preview Info Banner */}
            <div className="mb-4 md:mb-6 p-2.5 md:p-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] md:text-xs font-medium flex items-center gap-2">
              <span></span>
              <span>Preview — This is how your post will look when published</span>
            </div>

            {/* Blog Post Container */}
            <article className="max-w-3xl mx-auto">
              {/* Cover Image - Featured */}
              {(coverPreview || aiCoverUrl) && (
                <div className="rounded-lg md:rounded-xl overflow-hidden mb-6 md:mb-8 shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={coverPreview || aiCoverUrl}
                    alt="Cover"
                    className="w-full object-cover"
                    style={{ aspectRatio: '16 / 7' }}
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-6 md:mb-8">
                {/* Tags - Top */}
                <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                  {tags ? tags.split(',').map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] md:text-xs font-medium text-blue-600 bg-blue-50 px-2 md:px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      #{tag.trim()}
                    </span>
                  )) : null}
                </div>

                {/* Main Title - Large & Bold */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-3 md:mb-4 tracking-tight">
                  {title || <span className="text-gray-300">Untitled Article</span>}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-600 text-sm border-b border-gray-200 pb-4 md:pb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">You</p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs md:text-sm text-gray-500">
                    {Math.ceil(content.split(/\s+/).length / 200)} min read
                  </span>
                </div>
              </header>

              {/* Article Content */}
              <section className="mt-6 md:mt-8">
                <div className="prose prose-sm md:prose-base max-w-none 
                  prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-black prose-h1:text-gray-900 prose-h1:mt-6 prose-h1:mb-4
                  prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-5 prose-h2:mb-3
                  prose-h3:text-xl prose-h3:font-bold prose-h3:text-gray-900 prose-h3:mt-4 prose-h3:mb-2
                  prose-p:text-gray-800 prose-p:leading-7 prose-p:text-base md:prose-p:text-lg prose-p:my-4
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:rounded prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-strong:font-bold prose-strong:text-gray-900
                  prose-em:italic prose-em:text-gray-800
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                  prose-li:text-gray-800 prose-li:my-1 prose-li:leading-7
                  prose-hr:border-gray-300 prose-hr:my-6
                  prose-img:rounded-lg prose-img:shadow-md prose-img:my-6">
                  {content ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-lg font-bold text-gray-900 mt-3 mb-2" {...props} />,
                        h5: ({ node, ...props }) => <h5 className="text-base font-bold text-gray-900 mt-3 mb-2" {...props} />,
                        h6: ({ node, ...props }) => <h6 className="text-sm font-bold text-gray-900 mt-3 mb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="text-gray-800 leading-7 text-base md:text-lg my-4" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                        code: ({ node, inline, ...props }) =>
                          inline ?
                            <code className="bg-gray-100 text-red-600 px-2 py-1 rounded font-mono text-sm" {...props} /> :
                            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-4" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 px-4 py-3 rounded italic text-gray-700 my-4" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-gray-800" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-4" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-4" {...props} />,
                        li: ({ node, ...props }) => <li className="text-gray-800 my-1 leading-7" {...props} />,
                        hr: ({ node, ...props }) => <hr className="border-gray-300 my-6" {...props} />,
                        img: ({ node, ...props }) => <img className="rounded-lg shadow-md my-6 w-full" {...props} />,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-gray-400 italic">No content written yet...</span>
                  )}
                </div>
              </section>

              {/* Article Footer */}
              <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0"></div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm md:text-base">You</p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      Published Article • Follow for more
                    </p>
                  </div>
                </div>

                {/* Tags at bottom */}
                {tags && (
                  <div className="mt-6 md:mt-8 flex flex-wrap gap-2">
                    {tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] md:text-xs font-medium text-blue-600 bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </footer>
            </article>

            {/* Spacing */}
            <div className="h-12 md:h-16"></div>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="pb-2 md:pb-3.5 pt-2 md:pt-3.5" style={{ borderBottom: BORDER }}>
              <label className="block text-[10px] md:text-[11px] text-gray-400 uppercase tracking-wider mb-1 md:mb-1.5">Title</label>
              <input
                className="w-full border-none bg-transparent text-lg md:text-xl font-medium outline-none text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600"
                placeholder="Write an unforgettable title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="pb-2 md:pb-3.5 pt-2 md:pt-3.5" style={{ borderBottom: BORDER }}>
              <label className="block text-[10px] md:text-[11px] text-gray-400 uppercase tracking-wider mb-1 md:mb-1.5">Tags</label>
              <input
                className="w-full border-none bg-transparent text-xs md:text-sm outline-none text-gray-500 dark:text-gray-400 font-mono placeholder-gray-300 dark:placeholder-gray-600"
                placeholder="javascript, webdev, tutorial..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Cover image */}
            <div className="pb-2 md:pb-3.5 pt-2 md:pt-3.5" style={{ borderBottom: BORDER }}>
              <label className="block text-[10px] md:text-[11px] text-gray-400 uppercase tracking-wider mb-1 md:mb-1.5">Cover image</label>

              {!coverPreview && !aiCoverUrl ? (
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 text-center cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors mt-1"
                >
                  <span className="text-xl md:text-2xl block mb-1 md:mb-1.5">🖼</span>
                  <p className="text-xs md:text-sm text-gray-400 m-0">Click to upload or drag &amp; drop</p>
                  <span className="text-[10px] md:text-[11px] text-gray-300">PNG, JPG, WEBP — max 5 MB</span>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden bg-gray-50 mt-1" style={{ border: BORDER }}>
                  <img
                    src={coverPreview || aiCoverUrl}
                    alt="Cover"
                    className="w-full block object-cover"
                    style={{ aspectRatio: '16 / 7' }}
                  />
                  <div className="flex items-center justify-between px-2 md:px-2.5 py-1 md:py-1.5 bg-gray-50">
                    <span className="text-[10px] md:text-xs text-gray-400 truncate">
                      {coverImage?.name || '✨ AI Generated Cover'}
                    </span>
                    <button
                      onClick={removeAllImages}
                      className="border-none bg-transparent text-red-400 cursor-pointer text-[10px] md:text-xs hover:text-red-600 whitespace-nowrap ml-2"
                    >
                      🗑 Remove
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            {/* Toolbar + Content */}
            <div className="pt-2 md:pt-3.5">
              <label className="block text-[10px] md:text-[11px] text-gray-400 uppercase tracking-wider mb-1.5 md:mb-2.5">Content — Markdown</label>
              <div className="flex gap-0.5 mb-2 md:mb-2.5 flex-wrap">
                {[{ l: 'B', b: '**', a: '**' }, { l: 'I', b: '*', a: '*' }, { l: 'S', b: '~~', a: '~~' }].map((t) => (
                  <button key={t.l} onClick={() => insertMd(t.b, t.a)}
                    className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 text-xs md:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                    {t.l}
                  </button>
                ))}
                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1 self-stretch" />
                {['H1', 'H2', 'H3'].map((h) => (
                  <button key={h} onClick={() => insertMd('#'.repeat(+h[1]) + ' ', '')}
                    className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-[10px] md:text-sm font-medium hover:bg-gray-50">
                    {h}
                  </button>
                ))}
                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1 self-stretch" />
                <button onClick={() => insertMd('[', '](url)')} className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-sm hover:bg-gray-50">🔗</button>
                <button onClick={() => insertMd('```\n', '\n```')} className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-[10px] md:text-sm hover:bg-gray-50">{'</>'}</button>
                <button onClick={() => insertMd('> ', '')} className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-sm hover:bg-gray-50">❝</button>
                <button onClick={() => insertMd('- ', '')} className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-sm hover:bg-gray-50">≡</button>
                <div className="w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1 self-stretch" />
                <button onClick={() => fileRef.current.click()} className="w-7 h-7 md:w-[30px] md:h-[30px] flex items-center justify-center border border-gray-200 rounded-md cursor-pointer text-gray-500 bg-white text-sm hover:bg-gray-50">📷</button>
              </div>
              <textarea
                ref={textareaRef}
                className="w-full min-h-[150px] md:min-h-[180px] border-none bg-transparent text-xs md:text-sm outline-none resize-none font-mono leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600"

                placeholder="Start writing in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
              />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-gray-800"
        style={{ borderTop: BORDER }}>
        <span className="text-[10px] md:text-xs text-gray-300 dark:text-gray-600">{content.length} chars</span>
        <button onClick={clearAll} className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 border-none bg-transparent cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
          Clear
        </button>
      </div>

      {/* Published Blogs Table */}
      <div className="p-2 sm:p-3 md:p-4" style={{ borderTop: BORDER }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-xs md:text-sm font-medium m-0 dark:text-gray-200">Published blogs</h3>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">All your published articles</p>
          </div>
          <a href="https://dev.to/dashboard" target="_blank" rel="noreferrer"
            className="text-[10px] md:text-xs text-blue-500 no-underline hover:underline whitespace-nowrap">
            Dev.to dashboard ↗
          </a>
        </div>
        <div className="h-px bg-gray-200 dark:bg-gray-700 mb-3" />

        {/* Mobile: Card View, Desktop: Table View */}
        <div className="hidden md:block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">

          <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {['Title', 'Tags', 'Status', 'Published', 'Link', 'Actions'].map((h) => (
                  <th key={h} className="bg-gray-50 dark:bg-gray-800 px-2 md:px-3 py-2 text-left font-medium text-[11px] text-gray-500 dark:text-gray-400" style={{ borderBottom: BORDER }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-300 text-sm" style={{ borderBottom: BORDER }}>
                    No blogs yet
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className="px-2 md:px-3 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap text-gray-800 dark:text-gray-200 text-xs md:text-sm" style={{ borderBottom: BORDER }} title={blog.title}>
                      {blog.title}
                    </td>
                    <td className="px-2 md:px-3 py-2.5" style={{ borderBottom: BORDER }}>
                      {(blog.tags || []).map((t) => (
                        <span key={t} className="inline-block px-1.5 md:px-2 py-px rounded-full text-[10px] md:text-[11px] font-medium bg-blue-50 text-blue-700 mr-1 mb-1">
                          {t}
                        </span>
                      ))}
                    </td>
                    <td className="px-2 md:px-3 py-2.5" style={{ borderBottom: BORDER }}>
                      <span className={`inline-block px-1.5 md:px-2 py-px rounded-full text-[10px] md:text-[11px] font-medium ${blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : blog.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-2 md:px-3 py-2.5 text-gray-400 dark:text-gray-500 text-[10px] md:text-xs" style={{ borderBottom: BORDER }}>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-2 md:px-3 py-2.5" style={{ borderBottom: BORDER }}>
                      {blog.devtoUrl || blog.bloggerUrl ? (
                        <div className="flex flex-col gap-1">
                          {blog.devtoUrl && <a href={blog.devtoUrl} target="_blank" rel="noreferrer" className="text-[10px] md:text-xs text-blue-500 no-underline hover:underline">Dev.to ↗</a>}
                          {blog.bloggerUrl && <a href={blog.bloggerUrl} target="_blank" rel="noreferrer" className="text-[10px] md:text-xs text-orange-500 no-underline hover:underline">Blogger ↗</a>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-2 md:px-3 py-2.5 text-right" style={{ borderBottom: BORDER }}>
                      <div className="flex items-center gap-1.5 justify-end text-gray-400">
                        <button type="button" onClick={() => handleRevertDraft(blog)} title="Edit / Revert to Draft" className="p-1 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                          <PenLine size={14} />
                        </button>
                        <button type="button" onClick={() => handleShare(blog)} title="Share" className="p-1 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                          <Share2 size={14} />
                        </button>
                        <button type="button" onClick={() => handleDelete(blog._id)} title="Delete" className="p-1 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                          <Trash2 size={14} />
                        </button>
                        {blog.devtoUrl && (
                          <a href={blog.devtoUrl} target="_blank" rel="noreferrer" title="View on Dev.to" className="p-1 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 flex items-center justify-center transition-colors">
                            <Eye size={14} />
                          </a>
                        )}
                        {blog.bloggerUrl && (
                          <a href={blog.bloggerUrl} target="_blank" rel="noreferrer" title="View on Blogger" className="p-1 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 flex items-center justify-center transition-colors">
                            <Eye size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2">
          {blogs.length === 0 ? (
            <div className="px-3 py-6 text-center text-gray-300 dark:text-gray-600 text-xs bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

              No blogs yet
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">{blog.title}</h4>
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${blog.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : blog.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                    {blog.status}
                  </span>
                </div>

                {(blog.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.map((t) => (
                      <span key={t} className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col gap-1">
                    <span>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                    {blog.devtoUrl || blog.bloggerUrl ? (
                      <div className="flex gap-2">
                        {blog.devtoUrl && <a href={blog.devtoUrl} target="_blank" rel="noreferrer" className="text-blue-500 no-underline hover:underline font-medium">Dev.to ↗</a>}
                        {blog.bloggerUrl && <a href={blog.bloggerUrl} target="_blank" rel="noreferrer" className="text-orange-500 no-underline hover:underline font-medium">Blogger ↗</a>}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    <button type="button" onClick={() => handleRevertDraft(blog)} title="Edit / Revert to Draft" className="p-1.5 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                      <PenLine size={14} />
                    </button>
                    <button type="button" onClick={() => handleShare(blog)} title="Share" className="p-1.5 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                      <Share2 size={14} />
                    </button>
                    <button type="button" onClick={() => handleDelete(blog._id)} title="Delete" className="p-1.5 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AdminModal 
        isOpen={deleteData.isOpen} 
        onClose={() => setDeleteData({ isOpen: false, id: null })} 
        title="Delete Blog"
      >
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium m-0">
            Are you sure you want to delete this blog? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-none cursor-pointer bg-transparent"
              onClick={() => setDeleteData({ isOpen: false, id: null })}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors border-none cursor-pointer shadow-sm shadow-red-500/20"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </AdminModal>

      <TemplateShareSheet 
        open={shareData.isOpen} 
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        url={shareData.url}
        title={shareData.title}
      />
    </div>
  );
}