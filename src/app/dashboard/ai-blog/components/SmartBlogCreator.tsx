// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './MockUI';
// Mocks for missing components
const AutoBloggerConfig = () => <div>AutoBlogger Coming Soon</div>;
const ThemedToast = () => null;
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

// Mock payment APIs
const useGetCreditsQuery = () => ({ data: { credits: { availableTotal: 100 } } });
const useGetServiceCostsQuery = () => ({ data: { serviceCosts: [{ key: 'blog', cost: 1 }] } });

import BlogEditor from './BlogEditor';
import {
  useLazyGetTitleSuggestionsQuery,
  useGenerateBlogContentMutation,
  useGetGenerationStatusQuery,
  useGetBlogSessionQuery,
  useSaveTitlesMutation,
  useSaveDraftMutation,
  useSetActiveJobMutation,
  useGetBloggerStatusQuery,
  useGetMyBlogsQuery,
  useDeleteBlogMutation,
  usePublishBlogMutation,
  useGetBlogStatusQuery,
} from '@/hooks/useAIBlog';
import { Trash2, Eye, Share2, Sparkles } from 'lucide-react';



export default function SmartBlogCreator({ profileId, requireAuth }) {
  const [step, setStep] = useState('titles');
  const [selected, setSelected] = useState('');
  const [prefill, setPrefill] = useState(null);
  const CACHE_KEY = profileId && profileId !== 'undefined' ? `smartBlogState_${profileId}` : null;
  const getInitialState = () => {
    if (!CACHE_KEY) return null;
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return null;
  };
  const savedState = getInitialState();

  const [pollingJobs, setPollingJobs] = useState(savedState?.pollingJobs || []);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [showAutoBloggerModal, setShowAutoBloggerModal] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [publishingJobs, setPublishingJobs] = useState([]);
  
  const [autoBlogState, setAutoBlogState] = useState(savedState?.autoBlogState || {
    isActive: false,
    targetCount: 0,
    successfulCount: 0,
    failedCount: 0,
    config: null,
  });

  useEffect(() => {
    if (CACHE_KEY) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        autoBlogState,
        pollingJobs: pollingJobs.filter(j => j.status === 'processing' && j.jobId && !j.jobId.startsWith('temp-'))
      }));
    }
  }, [autoBlogState, pollingJobs, CACHE_KEY]);
  
  // Track dispatched titles to prevent concurrent duplicate dispatching before state updates
  const dispatchedTitlesRef = useRef(new Set());

  // ── Admin check ──
  const isAdmin = true; // Auto-enabled for the current user

  // ── Auto-queue state (admin only) ──
  const [autoQueue, setAutoQueue] = useState([]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const { data: creditsData } = useGetCreditsQuery();
  const { data: serviceCostsData } = useGetServiceCostsQuery();
  const { data: bloggerStatus } = useGetBloggerStatusQuery();
  
  const availableCredits = creditsData?.credits?.availableTotal ?? 0;
  const blogCost = serviceCostsData?.serviceCosts?.find(
    (s) => s.key === 'blog' || s.name?.toLowerCase().includes('blog')
  )?.cost ?? 0;
  const titlesPerPage = 5;

  // ── DB hooks ──
  const { data: session, isLoading: sessionLoading } = useGetBlogSessionQuery(profileId, {
    skip: !profileId || profileId === 'undefined',
  });
  const [saveTitles] = useSaveTitlesMutation();
  const [saveDraft] = useSaveDraftMutation();
  const [setActiveJob] = useSetActiveJobMutation();

  // ── Derive state from DB session ──
  const titles = session?.titles || [];
  const drafts = session?.drafts || []; // array [{title, content, tags, coverImage}]
  const activeJobs = session?.activeJobs || []; // array of {jobId, selectedTitle}

  // drafts array → map for O(1) lookup in TitleSelector
  const draftsMap = Object.fromEntries((drafts).map((d) => [d.title, d]));

  const { data: blogsData, refetch: refetchBlogs } = useGetMyBlogsQuery(
    { page: 1, limit: 500 },
    { pollingInterval: (showPublishedModal || autoBlogState.isActive) ? 5000 : 0 }
  );
  const [deleteBlogMutation] = useDeleteBlogMutation();
  const publishedBlogsList = (blogsData?.blogs || []).filter((b) => b.status === 'published');
  const publishedBlogsMap = Object.fromEntries(
    publishedBlogsList.map((b) => [b.title, b])
  );

  const [triggerGetTitles, { isLoading: titlesLoading, isError }] = useLazyGetTitleSuggestionsQuery();
  const [generateContent] = useGenerateBlogContentMutation();
  const [publishBlog] = usePublishBlogMutation();

  // ── Resume polling if activeJob exists in DB (e.g. page reload) ──
  // useEffect(() => {
  //   if (activeJob?.jobId && !isPolling) {
  //     setSelected(activeJob.selectedTitle);
  //     setIsPolling(true);
  //     toast.loading('Writing blog...', { id: 'blog-gen', duration: Infinity });
  //   }
  // }, [activeJob?.jobId]); // eslint-disable-line

  useEffect(() => {
    if (activeJobs.length > 0) {
      activeJobs.forEach((job) => {
        setPollingJobs(prev => {
          const alreadyTracking = prev.find(j => j.jobId === job.jobId || j.title === job.selectedTitle);
          if (alreadyTracking) {
            // Update the temp job with the real jobId just in case
            if (alreadyTracking.jobId !== job.jobId && alreadyTracking.jobId.startsWith('temp-')) {
              return prev.map(j => j.title === job.selectedTitle ? { ...j, jobId: job.jobId } : j);
            }
            return prev;
          }
          
          return [...prev, {
            jobId: job.jobId,
            title: job.selectedTitle,
            status: 'processing'
          }];
        });
      });
    }
  }, [activeJobs]);
  // ── Auto-fetch titles if DB session has none ──
  // Auto-fetch effect
  useEffect(() => {
    if (!profileId || profileId === 'undefined' || !session || titles.length > 0) return;
    triggerGetTitles(profileId)
      .unwrap()
      .then((res) => {
        if (res?.titles && profileId && profileId !== 'undefined') {
          saveTitles({ profileId, titles: res.titles, prepend: false });
        }
      })
      .catch((err) => console.error('Initial titles fetch failed:', err));
  }, [profileId, session]); // eslint-disable-line

  //   useEffect(() => {
  //   if (!profileId || profileId === 'undefined' || !session || titles.length > 0) return;
  //   triggerGetTitles(profileId)
  //     .unwrap()
  //     .then((res) => {
  //       if (res?.titles && profileId && profileId !== 'undefined') {
  //         saveTitles({ profileId, titles: res.titles, prepend: false });
  //       }
  //     })
  //     .catch((err) => console.error('Initial titles fetch failed:', err));
  // }, [profileId, session]);

  // ── Poll generation status ──



  // const { data: statusData } = useGetGenerationStatusQuery(
  //   activeJob?.jobId,
  //   {
  //     skip: !activeJob?.jobId || !isPolling,
  //     pollingInterval: 3000,
  //   }
  // );

  // useEffect(() => {
  //   if (!statusData) return;

  //   if (statusData.state === 'completed') {
  //     const res = statusData.result;
  //     const draftData = {
  //       title: res.title || selected,
  //       content: res.content,
  //       tags: Array.isArray(res.tags) ? res.tags.slice(0, 4).join(', ') : res.tags,
  //       coverImage: res.coverImage || null,
  //     };

  //     // Save draft + clear activeJob in DB
  //     saveDraft({ profileId, ...draftData });
  //     setActiveJob({ profileId, jobId: null, selectedTitle: null });

  //     setPrefill(draftData);
  //     toast.dismiss('blog-gen');
  //     toast.success('Blog ready!');
  //     setIsPolling(false);
  //     setStep('editor');

  //   } else if (statusData.state === 'failed') {
  //   setActiveJob({ profileId, jobId: null, selectedTitle: null });
  //   toast.dismiss('blog-gen');
  //   const errMsg = statusData.errorMessage || '';
  //   if (errMsg.toLowerCase().includes('insufficient credits') || errMsg.toLowerCase().includes('credits')) {
  //     toast.error('❌ ' + errMsg, { duration: 6000 });
  //   } else {
  //     toast.error('Generation failed. Please try again.');
  //   }
  //   setIsPolling(false);
  //   setStep('titles');
  // }
  // }, [statusData]); // eslint-disable-line

  // ── Handlers ──
  const [deleteData, setDeleteData] = useState({ isOpen: false, id: null });

  const handleDeletePublished = (id, e) => {
    e.stopPropagation();
    setDeleteData({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteData.id) return;
    try {
      await deleteBlogMutation(deleteData.id).unwrap();
      toast.success('Blog deleted');
      refetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog');
    } finally {
      setDeleteData({ isOpen: false, id: null });
    }
  };

  const [shareData, setShareData] = useState({ isOpen: false, url: '', title: '' });

  const handleSharePublished = (blog, e) => {
    e.stopPropagation();
    const url = blog.devtoUrl || blog.bloggerUrl;
    if (!url) return toast.error('No published link available');
    
    setShareData({ isOpen: true, url, title: blog.title });
  };

  async function handleImportGA4() {
    setIsManualLoading(true);
    const toastId = toast.loading('Importing URLs from GA4...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sites/${profileId}/ga4/overview?range=30d`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.topPages && data.topPages.length > 0) {
        const ga4Urls = data.topPages.map((p) => p.page).filter((url) => url && url !== '/');
        if (ga4Urls.length > 0) {
          await saveTitles({ profileId, titles: ga4Urls, prepend: true });
          setCurrentPage(1);
          toast.success(`Imported ${ga4Urls.length} pages from GA4!`, { id: toastId });
        } else {
          toast.error('No valid inner pages found in GA4.', { id: toastId });
        }
      } else {
        toast.error('No GA4 data available.', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to fetch GA4 data.', { id: toastId });
    } finally {
      setIsManualLoading(false);
    }
  }

  async function handleRefreshTitles() {
    setIsManualLoading(true);
    const toastId = toast.loading('Fetching 5 new titles...');
    try {
      const res = await triggerGetTitles(profileId, false).unwrap();
      if (res?.titles) {
        await saveTitles({ profileId, titles: res.titles, prepend: true });
        setCurrentPage(1);
        toast.success('5 New titles added on Page 1!', { id: toastId });
      } else {
        toast.error('Could not fetch new titles.', { id: toastId });
      }
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Error syncing titles', { id: toastId });
    } finally {
      setIsManualLoading(false);
    }
  }


  function handleTitleClick(titleObj) {
    requireAuth(() => {
      const title = typeof titleObj === 'string' ? titleObj : titleObj.title;
      const blogPageUrl = typeof titleObj === 'object' ? titleObj.url : null;

      if (draftsMap[title]) {
        setSelected(title);
        setPrefill(draftsMap[title]);
        setStep('editor');
        return;
      }
      setConfirmDialog({ title, titleObj, blogPageUrl });
    })
  }



  // async function proceedWithGeneration(titleObj, title, blogPageUrl) {
  //   setConfirmDialog(null);


  //   if (blogCost > 0 && availableCredits < blogCost) {
  //     const wasAutoQueue = isAdmin && isAutoMode;

  //     toast.custom(
  //       <ThemedToast
  //         type="error"
  //         message={`Insufficient credits! Need ${blogCost}, have ${availableCredits.toFixed(0)}.${
  //           wasAutoQueue ? ' Auto-queue paused.' : ''
  //         }`}
  //       />,
  //       { duration: 6000 }
  //     );

  //     // Stop auto-queue on credit failure
  //     if (wasAutoQueue) {
  //       setIsAutoMode(false);
  //       setAutoQueue([]);
  //     }
  //     return;
  //   }

  //   setSelected(title);
  //   try {
  //     console.log('🚀 Generating:', title);
  //     const res = await generateContent({ profileId, selectedTitle: title, blogPageUrl }).unwrap();
  //     await setActiveJob({ profileId, jobId: res.jobId, selectedTitle: title });
  //     setIsPolling(true);
  //     toast.loading('Writing blog...', { id: 'blog-gen', duration: Infinity });
  //   } catch (err) {
  //     console.error('❌ Gen failed:', err);

  //     // Stop auto-queue on any error
  //     if (isAdmin && isAutoMode) {
  //       setIsAutoMode(false);
  //       setAutoQueue([]);
  //     }

  //     const msg = err?.data?.message || err.message || '';
  //     if (err?.status === 402 || msg.toLowerCase().includes('credit')) {
  //       toast.error('❌ Insufficient credits! Please upgrade.', { duration: 5000 });
  //     } else {
  //       toast.custom(
  //         <ThemedToast type="error" message="Generation failed. Please try again." />,
  //         { id: 'blog-gen-fail', duration: 5000 }
  //       );
  //     }
  //     setStep('titles');
  //   }
  // }


  async function proceedWithGeneration(titleObj, title, blogPageUrl) {
    setConfirmDialog(null);

    if (blogCost > 0 && availableCredits < blogCost) {
      const wasAutoQueue = isAutoMode;

      toast.custom(
        <ThemedToast
          type="error"
          message={`Insufficient credits!...`}
        />,
        { duration: 6000 }
      );

      if (wasAutoQueue) {
        setIsAutoMode(false);
        setAutoQueue([]);
      }
      return;
    }

    setSelected(title);
    try {
      console.log('🚀 Generating:', title);
      const res = await generateContent({ profileId, selectedTitle: title, blogPageUrl }).unwrap();
      await setActiveJob({ profileId, jobId: res.jobId, selectedTitle: title });

      // ❌ YAHA SE HATAO (2 lines)
      // setIsPolling(true);
      // toast.loading('Writing blog...', { id: 'blog-gen', duration: Infinity });

      // ✅ YAHA ADD KARO (6 lines)
      setPollingJobs(prev => [...prev, {
        jobId: res.jobId,
        title: title,
        status: 'processing'
      }]);
      // toast removed — panel already shows writing status

    } catch (err) {
      console.error('❌ Gen failed:', err);

      if (isAutoMode) {
        setIsAutoMode(false);
        setAutoQueue([]);
      }

      const msg = err?.data?.message || err.message || '';
      if (err?.status === 402 || msg.toLowerCase().includes('credit')) {
        toast.error(`❌ ${msg || 'Insufficient credits!'}`, { duration: 5000 });
      } else {
        toast.custom(
          <ThemedToast type="error" message="Generation failed." />,
          { id: 'blog-gen-fail', duration: 5000 }
        );
      }
      setStep('titles');
    }
  }


  function handleBack() {
    toast.dismiss('blog-gen');
    setStep('titles');
    setIsPolling(false);
    setSelected('');
    setPrefill(null);
    setConfirmDialog(null);
  }

  const handleStartAutoBlog = async (config) => {
    const targetCount = config.targetCount || 10;
    
    if (config.customSourceUrls && config.customSourceUrls.length > 0) {
      toast.loading('Injecting custom website URLs...', { id: 'inject-urls' });
      try {
        const urlsToInject = config.customSourceUrls.slice(0, 200); // Safety limit
        await saveTitles({ profileId, titles: urlsToInject, prepend: true });
        toast.success(`Successfully loaded ${urlsToInject.length} custom website URLs!`, { id: 'inject-urls' });
      } catch (err) {
        toast.error('Failed to load custom URLs.', { id: 'inject-urls' });
      }
    }

    setAutoBlogState({
      isActive: true,
      targetCount: targetCount,
      successfulCount: 0,
      failedCount: 0,
      config: config
    });
    
    toast.success(`🚀 Initializing Auto-Blogger queue for ${targetCount} blogs...`);
  };

  // ── Auto-Blogger Orchestrator Loop ──
  useEffect(() => {
    if (!autoBlogState.isActive) return;

    if (autoBlogState.successfulCount >= autoBlogState.targetCount) {
      toast.success(`🎉 Auto-Blogger successfully fulfilled the target of ${autoBlogState.targetCount} blogs!`, { duration: 8000 });
      setAutoBlogState(prev => ({ ...prev, isActive: false }));
      return;
    }

    const inFlightCount = 
      pollingJobs.filter(j => j.isAutoPublish && j.status === 'processing').length + 
      publishingJobs.length;
    
    const MAX_CONCURRENT = 3;

    // Check if we can start a new job
    if (inFlightCount < MAX_CONCURRENT && (autoBlogState.successfulCount + inFlightCount < autoBlogState.targetCount)) {
      startNextAutoBlogJob();
    }
  }, [autoBlogState, pollingJobs, publishingJobs]);

  const startNextAutoBlogJob = async () => {
    // 1. Get available titles
    const processingTitles = new Set(
      pollingJobs.filter(j => j.status === 'processing').map(j => j.title)
    );
    let available = titles.filter(t => {
      const title = typeof t === 'string' ? t : t.title;
      return !draftsMap[title] && 
             !publishedBlogsMap[title] && 
             !processingTitles.has(title) &&
             !dispatchedTitlesRef.current.has(title);
    });

    // 2. Fetch more titles if we don't have any
    if (available.length === 0 && (!autoBlogState.config?.customSourceUrls || autoBlogState.config.customSourceUrls.length === 0)) {
      const toastId = toast.loading('Fetching more fresh titles for Auto-Blogger...');
      try {
        const res = await triggerGetTitles(profileId, false).unwrap();
        if (res?.titles) {
          await saveTitles({ profileId, titles: res.titles, prepend: true });
          const newAvailable = res.titles.filter(t => {
            const title = typeof t === 'string' ? t : t.title;
            return !draftsMap[title] && 
                   !publishedBlogsMap[title] && 
                   !processingTitles.has(title) &&
                   !dispatchedTitlesRef.current.has(title);
          });
          available = newAvailable;
          toast.success('Titles fetched successfully!', { id: toastId });
        } else {
          toast.error('Failed to fetch more titles.', { id: toastId });
          // Increment failed to trigger next iteration
          setAutoBlogState(prev => ({ ...prev, failedCount: prev.failedCount + 1 }));
          return;
        }
      } catch (err) {
        toast.error('Failed to fetch more titles.', { id: toastId });
        setAutoBlogState(prev => ({ ...prev, failedCount: prev.failedCount + 1 }));
        return;
      }
    }

    // 2.5 Inject customSourceUrls directly if present (to avoid RTK Query cache lag)
    if (autoBlogState.config?.customSourceUrls) {
      const customAvailable = autoBlogState.config.customSourceUrls.filter(url => 
        !draftsMap[url] && 
        !publishedBlogsMap[url] && 
        !processingTitles.has(url) && 
        !dispatchedTitlesRef.current.has(url)
      );
      // Ensure they take absolute priority by prepending
      available = [...new Set([...customAvailable, ...available])];
    }

    if (available.length === 0) {
      toast.error('Could not find available titles to process.');
      setAutoBlogState(prev => ({ ...prev, isActive: false }));
      return;
    }

    // 3. Start generation
    const t = available[0];
    const titleStr = typeof t === 'string' ? t : t.title;
    const url = typeof t === 'object' ? t.url : null;
    try {
      // Mark title as dispatched immediately (synchronously)
      dispatchedTitlesRef.current.add(titleStr);

      // Mark title immediately to prevent double processing in next rapid loop iteration
      const tempJobId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setPollingJobs(prev => [...prev, {
        jobId: tempJobId, // Temporary ID to prevent other loops from picking it
        title: titleStr,
        status: 'processing',
        isAutoPublish: true,
        platforms: autoBlogState.config.platforms
      }]);

      const targetProfileId = autoBlogState.config?.customProfileId || profileId;
      const res = await generateContent({ profileId: targetProfileId, selectedTitle: titleStr, blogPageUrl: url }).unwrap();
      
      setPollingJobs(prev => prev.map(j => 
        j.jobId === tempJobId ? { ...j, jobId: res.jobId } : j
      ));
    } catch (err) {
      toast.error(`Generation failed for: ${titleStr.substring(0, 20)}`);
      // Remove temp job and dispatched tracking
      dispatchedTitlesRef.current.delete(titleStr);
      setPollingJobs(prev => prev.filter(j => j.jobId !== tempJobId));
      setAutoBlogState(prev => ({ ...prev, failedCount: prev.failedCount + 1 }));
    }
  };

  // ── Admin: queue multiple titles ──
  function handleQueueAll(titles) {
    if (!titles.length) return;
    setAutoQueue(titles);
    setIsAutoMode(true);
    // Pehla title start karo
    const first = titles[0];
    requireAuth(() => {
      if (draftsMap[typeof first === 'string' ? first : first.title]) {
        setSelected(typeof first === 'string' ? first : first.title);
        setPrefill(draftsMap[typeof first === 'string' ? first : first.title]);
        setStep('editor');
        return;
      }
      setConfirmDialog({
        title: typeof first === 'string' ? first : first.title,
        titleObj: first,
        blogPageUrl: typeof first === 'object' ? first.url : null,
      });
    });
  }

  // ── Admin: ek blog publish hone ke baad next automatically start karo ──
  // function handleAutoNext() {
  //   const remaining = autoQueue.slice(1);
  //   setAutoQueue(remaining);

  //   if (remaining.length > 0) {
  //     const next = remaining[0];
  //     const nextTitle = typeof next === 'string' ? next : next.title;
  //     toast.success(`Starting next: "${nextTitle.substring(0, 40)}..."`, { duration: 3000 });
  //     handleBack();
  //     setTimeout(() => {
  //       requireAuth(() => {
  //         if (draftsMap[nextTitle]) {
  //           setSelected(nextTitle);
  //           setPrefill(draftsMap[nextTitle]);
  //           setStep('editor');
  //           return;
  //         }
  //         setConfirmDialog({
  //           title: nextTitle,
  //           titleObj: next,
  //           blogPageUrl: typeof next === 'object' ? next.url : null,
  //         });
  //       });
  //     }, 800);
  //   } else {
  //     setIsAutoMode(false);
  //     setAutoQueue([]);
  //     handleBack();
  //     toast.success('✅ All queued blogs published!', { duration: 5000 });
  //   }
  // }

  // ✅ AFTER
  // SmartBlogCreator.jsx - handleAutoNext() improvement
  function handleAutoNext() {
    const remaining = autoQueue.slice(1);
    setAutoQueue(remaining);

    console.log(`\n📋 [AUTO-QUEUE]`);
    console.log(`   Remaining : ${remaining.length}`);
    console.log(`   Next title: ${remaining[0] ? (typeof remaining[0] === 'string' ? remaining[0] : remaining[0].title).substring(0, 40) : 'NONE'}`);

    if (remaining.length > 0) {
      const next = remaining[0];
      const nextTitle = typeof next === 'string' ? next : next.title;

      toast.success(`Starting next: "${nextTitle.substring(0, 40)}..."`, { duration: 3000 });
      handleBack();

      // Longer delay to ensure previous job is fully completed
      setTimeout(() => {
        requireAuth(() => {
          const currentDraftsMap = Object.fromEntries(
            (drafts || []).map((d) => [d.title, d])
          );

          if (currentDraftsMap[nextTitle]) {
            setSelected(nextTitle);
            setPrefill(currentDraftsMap[nextTitle]);
            setStep('editor');
            return;
          }

          setConfirmDialog({
            title: nextTitle,
            titleObj: next,
            blogPageUrl: typeof next === 'object' ? next.url : null,
          });
        });
      }, 1200); // Increased delay
    } else {
      setIsAutoMode(false);
      setAutoQueue([]);
      handleBack();
      toast.success('✅ All queued blogs published!', { duration: 5000 });
    }
  }
  // ── Render ──
  if (sessionLoading) return <LoadingTitles />;

  if (step === 'titles') {
    // Titles jo abhi processing mein hain unhe list se hata do (duplicate na dikhe)
    const processingTitles = new Set(
      pollingJobs
        .filter(j => j.status === 'processing')
        .map(j => j.title)
    );
    const filteredTitles = titles.filter(t => {
      const title = typeof t === 'string' ? t : t.title;
      return !processingTitles.has(title);
    });

    const indexOfLastTitle = currentPage * titlesPerPage;
    const indexOfFirstTitle = indexOfLastTitle - titlesPerPage;
    const currentTitlesSlice = filteredTitles.slice(indexOfFirstTitle, indexOfLastTitle);

    return (
      <>
        {pollingJobs.length > 0 && (
          <ActiveJobsPanel
            jobs={pollingJobs}
            profileId={profileId}
            onJobComplete={async (jobId, draftData) => {
              saveDraft({ profileId, ...draftData });
              setActiveJob({ profileId, jobId, remove: true });
              setPollingJobs(prev => prev.map(j =>
                j.jobId === jobId ? { ...j, status: 'completed', title: draftData.title || j.title } : j
              ));
              toast.success(`✅ Done: ${draftData.title?.substring(0, 30)} (~ 50 - 60 Credits Deducted)`, { duration: 5000 });
              
              // NEW LOGIC FOR AUTO PUBLISH
              const job = pollingJobs.find(j => j.jobId === jobId);
              if (job && job.isAutoPublish) {
                const tempPublishId = `temp-pub-${Date.now()}`;
                try {
                  toast.success(`🚀 Auto-publishing: ${draftData.title?.substring(0, 30)}...`);
                  
                  setPublishingJobs(prev => [...prev, {
                    jobId: tempPublishId,
                    title: draftData.title,
                    isAutoPublish: true
                  }]);

                  const formData = new FormData();
                  formData.append('title', draftData.title);
                  formData.append('content', draftData.content);
                  if (draftData.tags) {
                    formData.append('tags', Array.isArray(draftData.tags) ? draftData.tags.join(',') : draftData.tags);
                  }
                  if (draftData.coverImage) {
                    formData.append('coverImageUrl', draftData.coverImage);
                  }
                  const platformsToSubmit = job.platforms || ['devto'];
                  formData.append('platforms', platformsToSubmit.join(','));

                  const res = await publishBlog(formData).unwrap();
                  
                  if (res.blog?.jobId) {
                    setPublishingJobs(prev => prev.map(p => p.jobId === tempPublishId ? {
                      ...p,
                      jobId: res.blog.jobId,
                      blogId: res.blog._id
                    } : p));
                  } else {
                     setPublishingJobs(prev => prev.filter(p => p.jobId !== tempPublishId));
                     setAutoBlogState(prev => prev.isActive ? { ...prev, successfulCount: prev.successfulCount + 1 } : prev);
                  }
                } catch (err) {
                  setPublishingJobs(prev => prev.filter(p => p.jobId !== tempPublishId));
                  const errMsg = err?.data?.message || err?.message || 'Server error';
                  toast.error(`Auto-publish failed for: ${draftData.title?.substring(0,30)} - ${errMsg}`);
                  setAutoBlogState(prev => prev.isActive ? { ...prev, failedCount: prev.failedCount + 1 } : prev);
                }
              }
            }}
            onJobFailed={(jobId) => {
              setPollingJobs(prev => prev.map(j =>
                j.jobId === jobId ? { ...j, status: 'failed' } : j
              ));
              const job = pollingJobs.find(j => j.jobId === jobId);
              if (job?.isAutoPublish) {
                setAutoBlogState(prev => prev.isActive ? { ...prev, failedCount: prev.failedCount + 1 } : prev);
              }
            }}
          />
        )}
        
        {publishingJobs.length > 0 && (() => {
          const handleJobComplete = (job) => {
            setPublishingJobs(prev => prev.filter(x => x.jobId !== job.jobId));
            toast.success(`🎉 Successfully published: ${job.title?.substring(0, 30)}!`);
            if (job.isAutoPublish) {
              setAutoBlogState(prev => prev.isActive ? { ...prev, successfulCount: prev.successfulCount + 1 } : prev);
            }
          };
          
          const handleJobFailed = (job, errorMsg) => {
            toast.error(`Publish failed for: ${job.title?.substring(0, 30)} - ${errorMsg || 'Unknown Error'}`);
            setPublishingJobs(prev => prev.filter(x => x.jobId !== job.jobId));
            if (job.isAutoPublish) {
              setAutoBlogState(prev => prev.isActive ? { ...prev, failedCount: prev.failedCount + 1 } : prev);
            }
          };
          
          return (
            <PublishingJobsPanel 
              jobs={publishingJobs} 
              onJobComplete={handleJobComplete} 
              onJobFailed={handleJobFailed}
            />
          );
        })()}
        
        {isAdmin && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowPublishedModal(true)}
                className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors font-semibold flex items-center gap-2 shadow-sm"
              >
                <Eye size={16} /> Show Published
              </button>
              <button
                onClick={() => setShowAutoBloggerModal(true)}
                className="text-sm text-white border-none rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors font-semibold flex items-center gap-2 shadow-sm"
              >
                <Sparkles size={16} /> Run Auto-Blogger
              </button>
            </div>
          </div>
        )}

        <Dialog open={showPublishedModal} onOpenChange={setShowPublishedModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <div className="mb-4 shrink-0 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 m-0">
                  Published Blogs ({publishedBlogsList.length})
                </h2>
                <p className="text-sm text-gray-500 mt-1">Blogs successfully published across your connected platforms.</p>
              </div>
              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 outline-none text-gray-700 dark:text-gray-200 shadow-sm"
              >
                <option value="all">All Time</option>
                <option value="pastHour">Past Hour</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
              </select>
            </div>
            
            <div className="border rounded-xl overflow-y-auto shadow-md bg-white dark:bg-gray-900 flex-1 relative">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider sticky top-0 z-10 shadow-sm after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-gray-200 dark:after:border-gray-700">
                  <tr>
                    <th className="px-4 py-3.5 font-bold text-center w-16">Sr. No.</th>
                    <th className="px-4 py-3.5 font-bold">Title</th>
                    <th className="px-4 py-3.5 font-bold w-36">Platforms</th>
                    <th className="px-4 py-3.5 font-bold w-40">Date</th>
                    <th className="px-4 py-3.5 font-bold text-center w-24">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {publishedBlogsList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-gray-500 font-medium">
                        No published blogs found.
                      </td>
                    </tr>
                  ) : (
                    publishedBlogsList
                      .filter(blog => {
                        if (publishedFilter === 'all') return true;
                        const date = new Date(blog.createdAt || Date.now());
                        const now = new Date();
                        if (publishedFilter === 'pastHour') {
                          return now - date <= 60 * 60 * 1000;
                        }
                        if (publishedFilter === 'today') {
                          return date.toDateString() === now.toDateString();
                        }
                        if (publishedFilter === 'yesterday') {
                          const yesterday = new Date(now);
                          yesterday.setDate(yesterday.getDate() - 1);
                          return date.toDateString() === yesterday.toDateString();
                        }
                        if (publishedFilter === 'last7days') {
                          return now - date <= 7 * 24 * 60 * 60 * 1000;
                        }
                        return true;
                      })
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((blog, index) => {
                        const link = blog.devtoUrl || blog.bloggerUrl || blog.url;
                        return (
                          <tr key={blog._id || blog.title} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                            <td className="px-4 py-3.5 text-center font-medium text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-gray-100">
                              {blog.title?.startsWith('http') ? (
                                <div className="flex flex-col">
                                  <span className="text-gray-900 dark:text-gray-100">Generated Blog</span>
                                  <span className="text-xs text-blue-500 font-normal truncate max-w-xs block" title={blog.title}>{blog.title}</span>
                                </div>
                              ) : (
                                blog.title
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1.5">
                                {blog.platforms && blog.platforms.length > 0 ? (
                                  blog.platforms.map((p, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 rounded-md text-[11px] font-bold capitalize tracking-wide shadow-sm">
                                      {p}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 rounded-md text-[11px] font-bold tracking-wide shadow-sm">Blogger</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
                              <span className="text-gray-400 text-[10px]">{new Date(blog.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {link ? (
                                <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center justify-center p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                                  title="View Published Blog"
                                >
                                  <Eye size={16} />
                                </a>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAutoBloggerModal} onOpenChange={setShowAutoBloggerModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <div className="sr-only">
              <DialogTitle>Auto-Blogger Configuration</DialogTitle>
              <DialogDescription>Configure the settings to automatically generate and publish blogs.</DialogDescription>
            </div>
            <AutoBloggerConfig 
              isModal={true} 
              onStart={(config) => {
                setShowAutoBloggerModal(false);
                handleStartAutoBlog(config);
              }} 
            />
          </DialogContent>
        </Dialog>

        <TitleSelector
          titles={currentTitlesSlice}
          totalTitlesCount={filteredTitles.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          loading={titlesLoading || isManualLoading}
          error={isError}
          onSelect={handleTitleClick}
          onRefresh={handleRefreshTitles}
          onImportGA4={handleImportGA4}
          drafts={draftsMap}
          isAdmin={isAdmin}
          onQueueAll={handleQueueAll}
          bloggerStatus={bloggerStatus}
          publishedBlogsMap={publishedBlogsMap}
          onDeletePublished={handleDeletePublished}
          onSharePublished={handleSharePublished}
          autoBlogState={autoBlogState}
          setAutoBlogState={setAutoBlogState}
        />
        {confirmDialog && (
          <ConfirmationDialog
            title={confirmDialog.title}
            cost={blogCost * (isAutoMode ? autoQueue.length : 1)}
            count={isAutoMode ? autoQueue.length : 1}
            onConfirm={() =>
              proceedWithGeneration(
                confirmDialog.titleObj,
                confirmDialog.title,
                confirmDialog.blogPageUrl
              )
            }
            onCancel={() => setConfirmDialog(null)}
          />
        )}
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
      </>
    );
  }



  function SingleJobPoller({ job, profileId, onComplete, onFailed }) {
    const [done, setDone] = useState(false);
    const { data } = useGetGenerationStatusQuery(job.jobId, {
      skip: done,
      pollingInterval: 3000,
    });

    useEffect(() => {
      if (!data || done) return;
      if (data.state === 'completed') {
        setDone(true);
        const res = data.result;
        
        let cleanedContent = res.content;
        if (typeof cleanedContent === 'string') {
          // Fix literal \n and \" that sometimes come from the AI/backend
          cleanedContent = cleanedContent.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");

          // Append Borade AI signature
          const signature = "\n\n---\n**Created by Borade AI**\n[https://www.borade.ai/](https://www.borade.ai/)";
          if (!cleanedContent.includes("Created by Borade AI")) {
            cleanedContent += signature;
          }
        }

        onComplete(job.jobId, {
          title: res.title || job.title,
          content: cleanedContent,
          tags: Array.isArray(res.tags) ? res.tags.slice(0, 4).join(', ') : res.tags,
          coverImage: res.coverImage || null,
        });
      } else if (data.state === 'failed') {
        setDone(true);
        onFailed(job.jobId);
      }
    }, [data, done]);

    return null;
  }

  function ActiveJobsPanel({ jobs, profileId, onJobComplete, onJobFailed }) {
    const active = jobs.filter(j => j.status !== 'completed');
    if (!active.length) return null;

    const sortedJobs = [...jobs].sort((a, b) => {
      if (a.status === 'processing' && b.status !== 'processing') return -1;
      if (a.status !== 'processing' && b.status === 'processing') return 1;
      return 0;
    });

    return (
      <div style={{
        background: '#EFF6FF',
        border: '0.5px solid #BFDBFE',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '300px'
      }}>
        <p style={{ fontSize: 12, color: '#1E3A8A', fontWeight: 500, marginBottom: 8, flexShrink: 0 }}>
          Generating {active.length} blog{active.length > 1 ? 's' : ''}...
        </p>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {sortedJobs.map(job => (
            <div key={job.jobId}>
              {/* Poller — invisible, sirf polling karta hai */}
              {job.status === 'processing' && (
                <SingleJobPoller
                  job={job}
                  profileId={profileId}
                  onComplete={onJobComplete}
                  onFailed={onJobFailed}
                />
              )}
              {/* UI row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                borderBottom: '0.5px solid #DBEAFE'
              }}>
                {job.status === 'processing' && (
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '2px solid #BFDBFE',
                    borderTopColor: '#2563EB',
                    animation: 'spin 0.8s linear infinite',
                    flexShrink: 0
                  }} />
                )}
                {job.status === 'completed' && <span style={{ color: '#3B6D11' }}>✓</span>}
                {job.status === 'failed' && <span style={{ color: '#A32D2D' }}>✗</span>}
                <span style={{ fontSize: 12, color: '#1E3A8A', flex: 1 }}>
                  {job.title?.startsWith('http') ? (
                    <span style={{ fontStyle: 'italic', color: '#2563EB' }}>
                      Generating title from link: <span style={{ color: '#6B7280', fontWeight: 'normal' }}>{job.title}</span>
                    </span>
                  ) : (
                    job.title?.substring(0, 50)
                  )}
                </span>
                <span style={{
                  fontSize: 11,
                  color: job.status === 'completed' ? '#3B6D11' :
                    job.status === 'failed' ? '#A32D2D' : '#2563EB'
                }}>
                  {job.status === 'processing' ? 'writing...' :
                    job.status === 'completed' ? 'done ✓' : 'failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function PublishingJobPoller({ job, onComplete, onFailed }) {
    const [done, setDone] = useState(false);
    const { data } = useGetBlogStatusQuery(job.blogId, {
      skip: done,
      pollingInterval: 3000,
    });

    useEffect(() => {
      if (!data || done) return;
      const status = data?.blog?.status;
      if (status === 'published') {
        setDone(true);
        onComplete(job);
      } else if (status === 'failed') {
        setDone(true);
        onFailed(job, data?.blog?.errorMessage);
      }
    }, [data, done, job, onComplete, onFailed]);

    return null;
  }

  function PublishingJobsPanel({ jobs, onJobComplete, onJobFailed }) {
    if (!jobs.length) return null;

    return (
      <div style={{
        background: '#FDF4FF', // fuchsia-50
        border: '0.5px solid #F5D0FE',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <p style={{ fontSize: 12, color: '#86198F', fontWeight: 500, marginBottom: 8 }}>
          Publishing {jobs.length} blog{jobs.length > 1 ? 's' : ''}...
        </p>
        {jobs.map(job => (
          <div key={job.jobId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>🚀</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: '#4A044E', fontWeight: 500 }}>
                {job.title?.substring(0, 50)}...
              </span>
              <span style={{
                fontSize: 11,
                color: '#C026D3',
                fontFamily: 'monospace'
              }}>
                publishing...
              </span>
            </div>
            <PublishingJobPoller 
              job={job} 
              onComplete={onJobComplete} 
              onFailed={onJobFailed} 
            />
          </div>
        ))}
      </div>
    );
  }


  // if (step === 'editor') {
  //   return (
  //     <div>
  //       <div className="flex items-center justify-between py-3 pb-4">
  //         <button
  //           onClick={handleBack}
  //           className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors shadow-sm"
  //         >
  //           ← Back to titles
  //         </button>
  //         <span className="text-xs text-gray-400">
  //           ✍️ {selected?.substring(0, 50)}{selected?.length > 50 ? '...' : ''}
  //         </span>
  //       </div>
  //       <BlogEditor initialData={prefill} />
  //     </div>
  //   );
  // }

  if (step === 'editor') {
    return (
      <div>
        <div className="flex items-center justify-between py-3 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors shadow-sm"
            >
              ← Back to titles
            </button>
            {/* Auto-queue progress badge */}
            {isAutoMode && autoQueue.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                Queue: {autoQueue.length} remaining
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            ✍️ {selected?.substring(0, 50)}{selected?.length > 50 ? '...' : ''}
          </span>
        </div>
        <BlogEditor
          initialData={prefill}
          onPublished={isAutoMode ? handleAutoNext : undefined}
          bloggerStatus={bloggerStatus}
        />
      </div>
    );
  }
}

// ─────────────────────────────────────────
// Sub-components (unchanged logic, same UI)
// ─────────────────────────────────────────

// function TitleSelector({ titles, totalTitlesCount, currentPage, setCurrentPage, loading, error, onSelect, onRefresh, drafts }) {
//   const [customTitle, setCustomTitle] = useState('');
//   const totalPages = Math.ceil(totalTitlesCount / 5) || 1;

function TitleSelector({ titles, totalTitlesCount, currentPage, setCurrentPage, loading, error, onSelect, onRefresh, onImportGA4, drafts, isAdmin, onQueueAll, bloggerStatus, publishedBlogsMap, onDeletePublished, onSharePublished, autoBlogState, setAutoBlogState }) {
  const [customTitle, setCustomTitle] = useState('');
  const [queueSelected, setQueueSelected] = useState([]);
  const totalPages = Math.ceil(totalTitlesCount / 5) || 1;

  function toggleQueue(titleObj) {
    const key = typeof titleObj === 'string' ? titleObj : titleObj.title;
    setQueueSelected(prev =>
      prev.some(t => (typeof t === 'string' ? t : t.title) === key)
        ? prev.filter(t => (typeof t === 'string' ? t : t.title) !== key)
        : [...prev, titleObj]
    );
  }

  function isInQueue(titleObj) {
    const key = typeof titleObj === 'string' ? titleObj : titleObj.title;
    return queueSelected.some(t => (typeof t === 'string' ? t : t.title) === key);
  }

  if (loading) return <LoadingTitles />;
  if (error)
    return (
      <div className="text-center py-16">
        <span className="text-4xl">⚠️</span>
        <p className="text-red-500 mt-3 text-sm">Complete website analysis first</p>
      </div>
    );

  return (
    <div className="w-full">
      {/* Blogger Connection UI */}
      {!bloggerStatus?.connected ? (
        <div className="mb-8 border border-blue-200 dark:border-blue-800/40 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-800/50">
          <div className="bg-blue-50 dark:bg-blue-900/10 px-5 py-4 border-b border-blue-100 dark:border-blue-800/20 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              B
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 m-0">Publish to Blogger</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                Connect your account to send AI-written blogs directly to your Blogger website.
              </p>
            </div>
          </div>
          
          <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-3 flex-1">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 m-0">How to connect:</h4>
              <ol className="list-decimal list-outside ml-4 space-y-2 text-xs text-gray-600 dark:text-gray-400 m-0">
                <li className="pl-1">
                  <strong>Create a Blog:</strong> You must have at least one blog container set up. Visit <a href="https://www.blogger.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 underline">Blogger.com</a> and create a blog if you haven't already.
                </li>
                <li className="pl-1">
                  <strong>Connect Account:</strong> Click the connect button below and sign in with the <em>exact same</em> Google account.
                </li>
              </ol>
            </div>
            <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs/blogger/login?token=${localStorage.getItem('token')}`}
                className="px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all whitespace-nowrap no-underline bg-blue-500 text-white hover:bg-blue-600 hover:shadow text-center border-none"
              >
                Connect Blogger
              </a>
              <span className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">1-Click Setup</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-green-50/50 dark:bg-green-900/10 border border-green-200/60 dark:border-green-800/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xl shrink-0 shadow-inner">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 m-0">Blogger Connected</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 m-0">
                Ready to publish to: <span className="font-semibold text-green-700 dark:text-green-400">{bloggerStatus.blogName || 'Your Blog'}</span>
              </p>
            </div>
          </div>
          <span className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 text-green-600 border border-green-200 shadow-sm whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active
          </span>
        </div>
      )}

      <div className="mb-6">
        {autoBlogState.isActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2 m-0">
                <Sparkles size={16} className="text-blue-600 animate-pulse" />
                Auto-Blogger is Running
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 m-0 mt-1">
                Successfully published: {autoBlogState.successfulCount} / {autoBlogState.targetCount} (Failed: {autoBlogState.failedCount})
              </p>
            </div>
            <button 
              onClick={() => setAutoBlogState(prev => ({ ...prev, isActive: false }))}
              className="text-xs font-semibold bg-white dark:bg-gray-800 border px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Stop Processing
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold m-0">Choose a Blog Title</h2>
          <div className="flex items-center gap-2">

            <button
              onClick={onImportGA4}
              className="text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 cursor-pointer transition-colors mr-2"
            >
              📊 Import GA4 URLs
            </button>
            <button
              onClick={onRefresh}
              className="text-sm text-white dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-blue-500 dark:bg-gray-800 cursor-pointer transition-colors"
            >
              ↻ New Titles
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1.5">
          AI-generated titles based on your business profile
        </p>
      </div>

      {titles.map((titleObj, i) => {
        const title = typeof titleObj === 'string' ? titleObj : titleObj.title;
        const url = typeof titleObj === 'object' ? titleObj.url : null;
        const hasDraft = !!drafts?.[title];
        const publishedBlog = publishedBlogsMap?.[title];
        const isPublished = !!publishedBlog;
        const absoluteIndex = (currentPage - 1) * 5 + i + 1;

        const inQueue = isInQueue(titleObj);

        return (
          <div
            key={i}
            className={`flex items-center gap-3.5 w-full px-5 py-4 mb-2.5 border rounded-xl text-left text-sm transition-shadow hover:shadow-md ${inQueue
              ? 'border-blue-400 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/40'
              : isPublished
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40 opacity-80'
                : hasDraft
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
          >

            <div
              className={`flex items-center gap-3.5 flex-1 text-left bg-transparent border-none p-0 ${isPublished ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => !isPublished && onSelect(titleObj)}
            >
              <span
                className={`min-w-[30px] h-[30px] rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${isPublished
                  ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-300'
                  : hasDraft
                    ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
              >
                {absoluteIndex}
              </span>
              <span className="flex-1 leading-relaxed text-gray-800 dark:text-gray-100">
                {title}
                {url && <span className="block text-[11px] text-gray-400 mt-0.5">🔗 {url}</span>}
                {isPublished ? (
                  <div className="flex gap-2 items-center mt-1.5 flex-wrap">
                    <span className="inline-block text-[10px] font-medium bg-green-100 text-green-800 border border-green-200 rounded-full px-2 py-px">
                      🔒 Published
                    </span>
                    {publishedBlog.devtoUrl && (
                       <span className="inline-block text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">Dev.to</span>
                    )}
                    {publishedBlog.bloggerUrl && (
                       <span className="inline-block text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full font-medium">Blogger</span>
                    )}
                  </div>
                ) : hasDraft && (
                  <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-px mt-1.5">
                    ✓ drafted
                  </span>
                )}
              </span>
              {isPublished ? (
                 <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {publishedBlog.devtoUrl && (
                      <a href={publishedBlog.devtoUrl} target="_blank" rel="noreferrer" title="View on Dev.to" className="p-1.5 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-blue-500 transition-colors">
                        <Eye size={16} />
                      </a>
                    )}
                    {publishedBlog.bloggerUrl && (
                      <a href={publishedBlog.bloggerUrl} target="_blank" rel="noreferrer" title="View on Blogger" className="p-1.5 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-orange-500 transition-colors">
                        <Eye size={16} />
                      </a>
                    )}
                    <button type="button" onClick={(e) => onSharePublished(publishedBlog, e)} title="Share" className="p-1.5 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-green-500 transition-colors">
                      <Share2 size={16} />
                    </button>
                    <button type="button" onClick={(e) => onDeletePublished(publishedBlog._id, e)} title="Delete" className="p-1.5 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded bg-transparent border-none cursor-pointer flex items-center justify-center text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                 </div>
              ) : (
                <span className={`text-base shrink-0 ${inQueue ? 'text-blue-500' : hasDraft ? 'text-blue-400' : 'text-gray-300'}`}>
                  {inQueue ? '✓' : hasDraft ? '→ Open' : '→'}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {totalTitlesCount > 5 && (
        <div className="flex items-center justify-between px-1 py-3.5 mt-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-3.5 py-1.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
              }`}
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-3.5 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-600 shadow-sm ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
              }`}
          >
            Next →
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2.5">Or write your own title:</p>
        <div className="flex gap-2.5">
          <input
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 font-sans"
            placeholder="Write your blog title here..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customTitle.trim()) {
                onSelect(customTitle.trim());
                setCustomTitle('');
              }
            }}
          />
          <button
            onClick={() => {
              if (customTitle.trim()) {
                onSelect(customTitle.trim());
                setCustomTitle('');
              }
            }}
            className={`px-5 py-3 bg-gray-800 text-white text-sm font-medium rounded-xl border-none ${customTitle.trim() ? 'opacity-100 cursor-pointer hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'
              }`}
          >
            Generate →
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingTitles() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold m-0">Choose a Blog Title</h2>
        <p className="text-sm text-gray-400 mt-1.5">AI-generated titles based on your business profile</p>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-xl mb-2.5 bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function ConfirmationDialog({ title, cost, count = 1, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-[90%] shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0">Generate AI Blog{count > 1 ? 's' : ''}</h3>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 m-0">
          Generate SEO-optimized blog content for {count} title{count > 1 ? 's' : ''}.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Title{count > 1 ? ' (First)' : ''}:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100 text-right line-clamp-2 font-medium">
                {title.startsWith('http') ? <span className="text-blue-600">Generating from link: <span className="text-gray-500 font-normal">{title}</span></span> : title}
              </span>
            </div>
            {count > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Blogs:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{count}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Format:</span>
              <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">Full Blog Post</span>
            </div>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">Cost:</span>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md">
              ~ {50 * count} - {60 * count} Credits (Approx)
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-2.5 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white border-none rounded-xl cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Generate
          </button>
        </div>
      </div>
    </div>
  );
}