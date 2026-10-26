import React, { useState, useRef, useEffect, useCallback } from 'react';
import I from '../../icons/icons.jsx';
import { Av, Modal } from '../../components/index.jsx';
import { fmt } from '../../utils/helpers.js';
import { SocialCtx } from '../../context/SocialContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { AuthorTrigger } from '../../popovers/ProfilePopover.jsx';
import { CommunityTrigger } from '../../popovers/CommunityPopover.jsx';
import PostActionMenu from '../../popovers/PostActionMenu.jsx';
import SaveFolderPanel from '../../popovers/SaveFolderPanel.jsx';
import SharePanel from '../../popovers/SharePanel.jsx';
import ActionDialog from '../../components/ActionDialog.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PostView from './pages/PostView.jsx';
import CommunityFeed from './pages/CommunityFeed.jsx';
import ReactionButton from '../../components/ReactionButton.jsx';
import { socialActionError } from '../../utils/socialActionError.js';
import { createDefaultUsername, isValidUsername, normalizeUsername } from '../../utils/username.js';
import { fetchProfiles, fetchProfilesByIds } from '../../services/supabaseService.js';
import { fetchPosts, fetchCommentsForPosts, createPost, updatePost, setPostCommentsEnabled, deletePost as deletePostService, togglePostLike, sharePost, fetchLikedPostIds, fetchSaveCollections, fetchSavedPostMap, createSaveCollection, toggleSavedPost, fetchFeedPreferences, hidePost, setUserModeration, reportPost, reportComment, togglePinnedPost } from '../../services/postService.js';
import { fetchCommunities, createCommunity, updateCommunitySettings, fetchPendingCommunityMembers, reviewCommunityMember, fetchFollowedUsers, toggleUserFollow, toggleCommunityFollow as toggleCommunityFollowService, toggleCommunityNotif as toggleCommunityNotifService } from '../../services/socialService.js';

function LinkSection({showToast,onGoToMessages,createPostRequest=0,onCommunityRightRailChange,onLinkStatsChange}){
  const { user, profile } = useAuth();
  const currentUserId = profile?.id || user?.id;
  const [page,setPage]=useState({type:"feed"});
  const [tab,setTab]=useState("discover");
  const [posts,setPosts]=useState([]);
  const [comments,setComments]=useState({});
  const [communities,setCommunities]=useState([]);
  const [users,setUsers]=useState({});
  const [liked,setLiked]=useState({});
  const [following,setFollowing]=useState({});
  const [actionDialog,setActionDialog]=useState(null);
  const [compose,setCompose]=useState("");
  const [reqCommOpen,setReqCommOpen]=useState(false);
  const [newCommunityName,setNewCommunityName]=useState('');
  const [newCommunityFocus,setNewCommunityFocus]=useState('');
  const [newCommunityDesc,setNewCommunityDesc]=useState('');
  const [newCommunityIcon,setNewCommunityIcon]=useState('🌱');
  const [creatingCommunity,setCreatingCommunity]=useState(false);
  const [communityCreateError,setCommunityCreateError]=useState('');
  const [postCreateError,setPostCreateError]=useState('');
  const [savedMap,setSavedMap]=useState({});
  const [saveCollections,setSaveCollections]=useState([]);
  const [hiddenPostIds,setHiddenPostIds]=useState([]);
  const [mutedUserIds,setMutedUserIds]=useState([]);
  const [blockedUserIds,setBlockedUserIds]=useState([]);
  const [saveOpen,setSaveOpen]=useState(null);
  const [shareOpen,setShareOpen]=useState(null);
  const [discoverSearch,setDiscoverSearch]=useState("");
  const [discoverFilter,setDiscoverFilter]=useState("All");
  const [filterDropOpen,setFilterDropOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const filterRef=useRef(null);
  const composeInputRef=useRef(null);

  useEffect(() => {
    if (!loading) onLinkStatsChange?.({ posts: posts.length, communities: communities.length });
  }, [communities.length, loading, onLinkStatsChange, posts.length]);

  useEffect(()=>{
    if(!createPostRequest) return undefined;
    setPage({type:"feed"});
    setTab("create");
    const focusFrame = requestAnimationFrame(() => composeInputRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  },[createPostRequest]);

  const upsertUniquePost = (items, item) => {
    if (!item || !item.id) return items;
    return [item, ...items.filter(existing => existing.id !== item.id)];
  };

  useEffect(()=>{
    function h(e){if(filterRef.current&&!filterRef.current.contains(e.target))setFilterDropOpen(false);}
    if(filterDropOpen) document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[filterDropOpen]);

  useEffect(()=>{
    async function loadFeed(){
      setLoading(true);
      try {
        const [profiles, comms, postRows, likedPostIds, collections, savedPosts, preferences, followedUserIds] = await Promise.all([
          fetchProfiles(),
          fetchCommunities(),
          fetchPosts(),
          fetchLikedPostIds(currentUserId),
          currentUserId ? fetchSaveCollections() : Promise.resolve([]),
          currentUserId ? fetchSavedPostMap() : Promise.resolve({}),
          currentUserId ? fetchFeedPreferences() : Promise.resolve({ hiddenPostIds: [], mutedUserIds: [], blockedUserIds: [] }),
          currentUserId ? fetchFollowedUsers(currentUserId) : Promise.resolve([]),
        ]);

        const getInitials = name => (name||'').split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'US';
        const profileMap = {};
        const addProfile = item => {
          const fullName = (item.full_name || item.name || item.email || 'Farm User').toString().trim();
          const candidateUsername = normalizeUsername(item.username || '');
          profileMap[item.id] = {
            id: item.id,
            name: fullName,
            username: isValidUsername(candidateUsername)
              ? candidateUsername
              : createDefaultUsername(fullName, item.id, item.email),
            initials: item.initials || getInitials(fullName),
            role: item.role || 'Member',
            bio: item.bio || '',
            followers: item.followers || 0,
            following: item.following || 0,
            joined: item.joined || '',
            avatar_url: item.avatar_url || item.avatarUrl || item.photo_url || null,
            avatarUrl: item.avatar_url || item.avatarUrl || item.photo_url || null,
          };
        };

        const normalizedPosts = postRows.map(p => ({
          id: p.id,
          authorId: p.author_id || p.authorId || p.user_id || null,
          body: p.body || p.content || '',
          createdAt: p.created_at || p.createdAt || null,
          tags: p.tags || [],
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          communityId: p.community_id || p.communityId || null,
          image: p.image || p.media || null,
          pinnedAt: p.pinned_at || p.pinnedAt || null,
        }));

        const commentMap = await fetchCommentsForPosts(normalizedPosts.map(p => p.id));
        const commentsList = Object.values(commentMap).flat();
        const authorIds = [...new Set([
          ...normalizedPosts.map(post => post.authorId),
          ...commentsList.flatMap(comment => [
            comment.authorId || comment.author_id,
            ...(comment.replies || []).map(reply => reply.authorId || reply.author_id),
          ]),
        ].filter(Boolean).map(String))];
        const loadedProfileIds = new Set(profiles.map(item => String(item.id)));
        const missingProfileIds = authorIds.filter(id => !loadedProfileIds.has(id));
        const additionalProfiles = await fetchProfilesByIds(missingProfileIds);
        [...profiles, ...additionalProfiles].forEach(addProfile);

        if (profile?.id) {
          const currentName = (
            profile.full_name
            || user?.user_metadata?.full_name
            || user?.user_metadata?.name
            || profile.email
            || user?.email?.split('@')[0]
            || 'You'
          ).toString().trim();
          const candidateUsername = normalizeUsername(profile.username || '');
          profileMap[profile.id] = {
            id: profile.id,
            name: currentName,
            username: isValidUsername(candidateUsername)
              ? candidateUsername
              : createDefaultUsername(currentName, profile.id, user?.email),
            initials: profile.initials || getInitials(currentName),
            role: profile.role || 'Member',
            bio: profile.bio || '',
            followers: profile.followers || 0,
            following: profile.following || 0,
            joined: profile.joined || '',
            avatar_url: profile.avatar_url || null,
            avatarUrl: profile.avatar_url || null,
          };
        }

        authorIds.forEach(id => {
          if (!profileMap[id]) {
            profileMap[id] = {
              id,
              name: 'Member',
              username: createDefaultUsername('Member', id),
              initials: 'ME',
              role: 'Member',
              bio: '',
              followers: 0,
              following: 0,
              joined: '',
              avatarUrl: null,
            };
          }
        });

        setUsers(profileMap);
        setCommunities(comms.map(c => ({
          ...c,
          members: c.members || 0,
          posts: c.posts || 0,
          followed: !!c.followed,
          pending: !!c.pending,
          notif: !!c.notif,
          count: c.count || 0,
          ico: c.ico || '🌱',
          desc: c.desc || '',
        })));
        setPosts(normalizedPosts);
        setComments(commentMap);
        setLiked(Object.fromEntries(likedPostIds.map(id => [id, true])));
        setSaveCollections(collections);
        setSavedMap(savedPosts);
        setHiddenPostIds(preferences.hiddenPostIds);
        setMutedUserIds(preferences.mutedUserIds);
        setBlockedUserIds(preferences.blockedUserIds);
        setFollowing(Object.fromEntries(followedUserIds.map(id => [id, true])));

          const params = new URLSearchParams(window.location.search);
        const resolveId = value => value && /^\d+$/.test(value) ? Number(value) : value;
        if (params.has('post')) {
          setPage({ type: 'post', postId: resolveId(params.get('post')), highlightCommentId: resolveId(params.get('comment')) || null });
        } else if (params.has('profile')) {
          setPage({ type: 'profile', userId: resolveId(params.get('profile')) });
        } else if (params.has('community')) {
          setPage({ type: 'community', communityId: resolveId(params.get('community')) });
        }
      } catch (error) {
        console.error('Error loading link feed', error);
        showToast('error', 'Unable to load social feed.');
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [showToast, profile, user, currentUserId]);

  async function toggleLike(id){
    if(!currentUserId){
      showToast('error','Please sign in to like posts.');
      return;
    }
    const isLiked = !!liked[id];
    try {
      const updatedPost = await togglePostLike(id, currentUserId, isLiked);
      setLiked(p=>({...p,[id]:updatedPost.liked}));
      setPosts(p=>p.map(x=>x.id===id?{...x, likes: updatedPost.likes || 0}:x));
      return updatedPost.liked;
    } catch (error) {
      console.error('Error toggling like', error);
      showToast('error','Unable to update like.');
      return false;
    }
  }

  async function copyPostLink(post){
    const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('ok','Post link copied to clipboard!');
    } catch (error) {
      console.warn('Clipboard copy failed', error);
      showToast('info','Copy this link: ' + url);
    }
  }

  async function submitPost(communityId){
    if(!compose.trim()) return;
    if(!currentUserId){
      showToast('error','Please sign in to publish posts.');
      return;
    }
    setPostCreateError('');
    const tagMatches=compose.match(/#([a-zA-Z0-9_]+)/g)||[];
    const extractedTags=[...new Set(tagMatches.map(t=>t.slice(1)))];
    const cleanBody=compose.replace(/#([a-zA-Z0-9_]+)/g," ").replace(/\s{2,}/g," ").trim();
    const payload={
      author_id: profile?.id || user?.id,
      body: cleanBody,
      tags: extractedTags,
      community_id: communityId || null,
      likes:0,
      shares:0,
      created_at:new Date().toISOString(),
    };
    try {
      const newPost = await createPost(payload);
      const formatted = {
        id: newPost.id,
        authorId: newPost.authorId || profile?.id || user?.id,
        body: newPost.body || cleanBody,
        createdAt: newPost.createdAt || newPost.created_at || new Date().toISOString(),
        tags: newPost.tags || extractedTags,
        likes: newPost.likes || 0,
        comments: 0,
        shares: newPost.shares || 0,
        communityId: newPost.communityId || communityId || null,
        image: newPost.image || null,
      };
      setPosts(p => upsertUniquePost(p, formatted));
      setCompose("");
      if(communityId){
        setCommunities(p=>p.map(c=>c.id===communityId?{...c,posts:(c.posts||0)+1}:c));
      } else {
        setTab("discover");
      }
      showToast("ok","Post published!");
    } catch (error) {
      console.error('Error creating post', error);
      const message=socialActionError(error,'publish this post');
      setPostCreateError(message);
      showToast('error',message);
    }
  }

  function removePost(post){
    setActionDialog({
      title: 'Delete post?',
      message: 'This permanently removes the post and its comments, reactions, and saved copies. This cannot be undone.',
      confirmLabel: 'Delete post',
      danger: true,
      onConfirm: async () => {
        try {
          await deletePostService(post.id);
          setPosts(previous => previous.filter(item => item.id !== post.id));
          setComments(previous => {
            const next = { ...previous };
            delete next[post.id];
            return next;
          });
          if (post.communityId) {
            setCommunities(items => items.map(item => item.id === post.communityId
              ? { ...item, posts: Math.max(0, Number(item.posts || 0) - 1) }
              : item));
          }
          if (page.type === 'post') goFeed();
          showToast('ok', 'Post deleted.');
          return true;
        } catch (error) {
          console.error('Post delete error', error);
          showToast('error', error.message || 'Unable to delete this post.');
          return false;
        }
      },
    });
  }

  function editPost(post){
    setActionDialog({
      title: 'Edit post',
      message: 'Update your post. Hashtags are saved as topics.',
      inputType: 'textarea',
      initialValue: post.body || '',
      placeholder: 'Write your post…',
      confirmLabel: 'Save changes',
      required: true,
      validationMessage: 'A post cannot be empty.',
      onConfirm: async editedText => {
        const tagMatches = editedText.match(/#([a-zA-Z0-9_]+)/g) || [];
        const tags = [...new Set(tagMatches.map(tag => tag.slice(1)))];
        const body = editedText.replace(/#([a-zA-Z0-9_]+)/g, ' ').replace(/\s{2,}/g, ' ').trim();
        if (!body) {
          showToast('error', 'A post cannot be empty.');
          return false;
        }
        try {
          const updated = await updatePost(post.id, currentUserId, { body, tags });
          setPosts(items => items.map(item => item.id === post.id ? { ...item, ...updated } : item));
          showToast('ok', 'Post updated.');
          return true;
        } catch (error) {
          console.error('Post update error', error);
          showToast('error', error.message || 'Unable to update post.');
          return false;
        }
      },
    });
  }

  async function togglePostComments(post){
    try {
      const updated = await setPostCommentsEnabled(post.id, currentUserId, post.commentsEnabled === false);
      setPosts(items => items.map(item => item.id === post.id ? { ...item, ...updated } : item));
      showToast('ok', updated.commentsEnabled ? 'Comments enabled.' : 'Comments disabled.');
    } catch (error) {
      console.error('Post comment setting error', error);
      showToast('error', error.message || 'Unable to update comment settings.');
    }
  }

  async function submitCommunityRequest(){
    setCommunityCreateError('');
    if(!newCommunityName.trim()){
      const message='Community name is required.';
      setCommunityCreateError(message);
      showToast('error',message);
      return;
    }
    if(!currentUserId){
      const message='Please sign in to create a community.';
      setCommunityCreateError(message);
      showToast('error',message);
      return;
    }
    setCreatingCommunity(true);
    try {
      const community = await createCommunity({
        name: newCommunityName.trim(),
        desc: [newCommunityFocus.trim(), newCommunityDesc.trim()].filter(Boolean).join(' · '),
        ico: newCommunityIcon,
        members: 1,
        posts: 0,
        followed: true,
        notif: false,
      });
      setCommunities(prev => [community, ...prev]);
      setNewCommunityName('');
      setNewCommunityFocus('');
      setNewCommunityDesc('');
      setNewCommunityIcon('🌱');
      setReqCommOpen(false);
      setPage({ type: 'community', communityId: community.id });
      showToast('ok','Community created successfully!');
    } catch (error) {
      console.error('Community create error', error);
      const message=socialActionError(error,'create this community');
      setCommunityCreateError(message);
      showToast('error',message);
    } finally {
      setCreatingCommunity(false);
    }
  }
  async function toggleFollow(userId){
    if (!userId || !currentUserId || String(userId) === String(currentUserId)) return;
    const shouldFollow = !following[userId];
    setFollowing(previous => ({ ...previous, [userId]: shouldFollow }));
    try {
      await toggleUserFollow(currentUserId, userId, shouldFollow);
    } catch (error) {
      setFollowing(previous => ({ ...previous, [userId]: !shouldFollow }));
      showToast('error', error.message || 'Unable to update follow status.');
    }
  }
  async function toggleFollowCommunity(id, requestedFollow){
    const current = communities.find(c=>c.id===id);
    if(!current) return;
    const nextFollow = typeof requestedFollow === 'boolean' ? requestedFollow : !current.followed;
    try {
      const updated = await toggleCommunityFollowService(id, nextFollow, current.notif);
      setCommunities(p=>p.map(c=>c.id===id?{...c,...updated,followed:!!updated.followed,pending:!!updated.pending,members:updated.members??c.members}:c));
      showToast('ok', updated.pending ? 'Join request sent.' : updated.followed ? 'Following community.' : 'Unfollowed community.');
    } catch (error) {
      console.error('Community follow error', error);
      showToast('error',error.message||'Unable to update community follow status.');
    }
  }
  async function handleShare(post, method){
    if(!post) return;
    if(!currentUserId){
      showToast('error','Please sign in to share posts.');
      return;
    }
    try {
      if(method !== 'native'){
        showToast('info','External links and copied links are not counted as completed shares.');
        return;
      }
      if (!navigator.share) {
        showToast('info','Native sharing is not available in this browser. Use a share destination or copy the link.');
        return;
      }
      try {
        await navigator.share({ title: 'Infinite Sprouts', text: post.body, url: `${window.location.origin}${window.location.pathname}?post=${post.id}` });
      } catch (error) {
        if (error?.name === 'AbortError') return;
        throw error;
      }
      const { post: updatedPost } = await sharePost(post.id, currentUserId, 'native');
      setPosts(p=>p.map(x=>x.id===post.id?{...x, shares: updatedPost.shares}:x));
      showToast('ok','Post shared!');
    } catch (error) {
      console.error('Error sharing post', error);
      showToast('error', 'Unable to share post.');
    }
  }

  async function handleSaveToggle(postId, collectionId){
    try {
      const saved = await toggleSavedPost(postId, collectionId);
      const key = String(postId);
      setSavedMap(previous => ({
        ...previous,
        [key]: saved ? [...(previous[key] || []), collectionId] : (previous[key] || []).filter(id => id !== collectionId),
      }));
    } catch (error) {
      showToast('error', error.message || 'Unable to update saved post.');
      throw error;
    }
  }

  async function handleCreateCollection(name){
    const collection = await createSaveCollection(name);
    setSaveCollections(previous => [...previous, collection]);
    return collection;
  }

  const openSavePanel = useCallback((post, anchor) => {
    setShareOpen(null);
    setSaveOpen({ post, anchor });
  }, []);
  const openSharePanel = useCallback((post, anchor) => {
    setSaveOpen(null);
    setShareOpen({ post, anchor });
  }, []);
  const closeSavePanel = useCallback(() => setSaveOpen(null), []);
  const closeSharePanel = useCallback(() => setShareOpen(null), []);

  async function handleHidePost(post){
    try {
      await hidePost(post.id);
      setHiddenPostIds(previous => [...new Set([...previous, String(post.id)])]);
      if (page.type === 'post') goFeed();
      showToast('ok', 'Post hidden from your feed.');
    } catch (error) { showToast('error', error.message || 'Unable to hide this post.'); }
  }

  async function handleUserModeration(post, table){
    if (!post.authorId) return false;
    try {
      await setUserModeration(post.authorId, table);
      if (table === 'muted_users') setMutedUserIds(previous => [...new Set([...previous, String(post.authorId)])]);
      else setBlockedUserIds(previous => [...new Set([...previous, String(post.authorId)])]);
      if (page.type === 'post') goFeed();
      showToast('ok', table === 'muted_users' ? 'Author muted.' : 'Author blocked.');
      return true;
    } catch (error) {
      showToast('error', error.message || 'Unable to update moderation settings.');
      return false;
    }
  }

  function confirmBlockUser(post){
    setActionDialog({
      title: 'Block this person?',
      message: 'Their posts will be hidden from your feed.',
      confirmLabel: 'Block user',
      danger: true,
      onConfirm: () => handleUserModeration(post, 'blocked_users'),
    });
  }

  async function handleReportComment(commentId){
    setActionDialog({
      title: 'Report comment',
      message: 'Tell us why this comment should be reviewed.',
      inputType: 'textarea',
      placeholder: 'Describe the issue…',
      confirmLabel: 'Submit report',
      required: true,
      validationMessage: 'Add a reason before submitting.',
      onConfirm: async reason => {
        try {
          await reportComment(commentId, reason.trim());
          showToast('ok', 'Comment report submitted for review.');
          return true;
        } catch (error) {
          showToast('error', error.message || 'Unable to report this comment.');
          return false;
        }
      },
    });
  }

  async function handleReportPost(post){
    setActionDialog({
      title: 'Report post',
      message: 'Tell us why this post should be reviewed.',
      inputType: 'textarea',
      placeholder: 'Describe the issue…',
      confirmLabel: 'Submit report',
      required: true,
      validationMessage: 'Add a reason before submitting.',
      onConfirm: async reason => {
        try {
          await reportPost(post.id, reason.trim());
          showToast('ok', 'Report submitted for review.');
          return true;
        } catch (error) {
          showToast('error', error.message || 'Unable to submit this report.');
          return false;
        }
      },
    });
  }

  async function handlePinPost(post){
    try {
      const result = await togglePinnedPost(post.id);
      setPosts(previous => previous.map(item => item.id === post.id ? { ...item, pinnedAt: result.pinned ? result.pinned_at : null } : item));
      showToast('ok', result.pinned ? 'Post pinned to your profile.' : 'Post unpinned.');
    } catch (error) { showToast('error', error.message || 'Unable to pin post.'); }
  }

  async function toggleNotif(id){
    const current = communities.find(c=>c.id===id);
    if(!current) return;
    const nextNotif = !current.notif;
    try {
      const updated = await toggleCommunityNotifService(id, nextNotif, current.followed);
      setCommunities(p=>p.map(c=>c.id===id?{...c,...updated,notif:nextNotif}:c));
      showToast('ok', nextNotif ? 'Notifications enabled.' : 'Notifications disabled.');
    } catch (error) {
      console.error('Community notif error', error);
      showToast('error','Unable to update notification settings.');
    }
  }
  function toggleSave(postId,folderId){
    setSavedMap(p=>{
      const cur=p[postId]||[];
      const next=cur.includes(folderId)?cur.filter(f=>f!==folderId):[...cur,folderId];
      return {...p,[postId]:next};
    });
  }
  function handleDM(user){
    showToast("info","Opening a chat with "+user.name+"…");
    onGoToMessages&&onGoToMessages();
  }
  function goProfile(userId){setPage({type:"profile",userId});}
  function goPost(postId,highlightCommentId){setPage({type:"post",postId,highlightCommentId:highlightCommentId||null});}
  function goCommunity(communityId){
    setCommunities(p=>p.map(c=>c.id===communityId?{...c,count:0}:c));
    setPage({type:"community",communityId});
  }
  function goFeed(){setPage({type:"feed"});}

  const socialCtxValue={
    users,
    currentUserId,
    communities,
    following,
    onToggleFollow:toggleFollow,
    onToggleFollowCommunity:toggleFollowCommunity,
    onDM:handleDM,
    onSeeProfile:goProfile,
    onGoCommunity:goCommunity,
  };
  const actionDialogElement = (
    <ActionDialog
      dialog={actionDialog}
      onClose={() => setActionDialog(null)}
      onSubmit={value => actionDialog?.onConfirm?.(value)}
    />
  );
  const actionPanels = (
    <>
      <SaveFolderPanel
        open={!!saveOpen}
        onClose={closeSavePanel}
        anchor={saveOpen?.anchor}
        post={saveOpen?.post}
        collections={saveCollections}
        savedMap={savedMap}
        onToggleSave={handleSaveToggle}
        onCreateCollection={handleCreateCollection}
        showToast={showToast}
      />
      <SharePanel
        open={!!shareOpen}
        onClose={closeSharePanel}
        anchor={shareOpen?.anchor}
        post={shareOpen?.post}
        showToast={showToast}
        onShare={handleShare}
      />
    </>
  );

  const filteredPosts=posts.filter(p=>{
    if (hiddenPostIds.includes(String(p.id)) || mutedUserIds.includes(String(p.authorId)) || blockedUserIds.includes(String(p.authorId))) return false;
    if(p.communityId) return false; // community posts live in their community feed only
    const q=discoverSearch.trim().toLowerCase();
    const matchesSearch=!q||p.body.toLowerCase().includes(q)||(p.tags||[]).some(t=>t.toLowerCase().includes(q))||(users[p.authorId]?.name||"").toLowerCase().includes(q);
    const matchesFilter=discoverFilter==="All"||(p.tags||[]).some(t=>t.toLowerCase()===discoverFilter.toLowerCase());
    return matchesSearch&&matchesFilter;
  }).sort((a, b) => (b.pinnedAt ? 1 : 0) - (a.pinnedAt ? 1 : 0) || new Date(b.pinnedAt || b.createdAt || 0) - new Date(a.pinnedAt || a.createdAt || 0));

  function PostCard({p}){
    const isOwner=String(p.authorId)===String(currentUserId);
    const user=users[p.authorId]||{};
    return(
      <div className="gvp-card">
        {/* HEADER */}
        <div className="gvp-header">
          <AuthorTrigger userId={p.authorId} createdAt={p.createdAt}/>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            {p.communityId&&(
              <CommunityTrigger communityId={p.communityId}>
                <span style={{fontSize:10.5,color:"var(--ac)",fontWeight:600,background:"var(--as)",padding:"2px 8px",borderRadius:"var(--rf)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:3}}>
                  {(socialCtxValue.communities||[]).find(c=>c.id===p.communityId)?.ico} Community
                </span>
              </CommunityTrigger>
            )}
            <PostActionMenu post={p} isOwner={isOwner} onEdit={editPost} onDelete={removePost} onTurnOffComments={togglePostComments} onCopyLink={copyPostLink} onPin={handlePinPost} onHide={handleHidePost} onMute={()=>handleUserModeration(p,'muted_users')} onBlock={()=>confirmBlockUser(p)} onReport={()=>handleReportPost(p)} showToast={showToast}/>
          </div>
        </div>

        {/* BODY */}
        <div className="gvp-body" onClick={()=>goPost(p.id)} style={{cursor:"pointer"}}>
          {p.image?
            <div className="gvp-media-wrap">
              <div className="gvp-cinematic"/>
              <div className="gvp-slide show" style={{aspectRatio:"16/9"}}>
                <div className="post-img">{p.image}</div>
              </div>
            </div>:
            <div className="gvp-text-only">
              <div className="post-body">{p.body}</div>
            </div>
          }
          {p.tags&&p.tags.length>0&&(
            <div className="post-tags">
              {p.tags.map(t=><span key={t} className="post-tag">#{t}</span>)}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="gvp-footer">
          <ReactionButton liked={!!liked[p.id]} count={p.likes} onToggle={()=>toggleLike(p.id)} />
          <button className="post-act" onClick={()=>goPost(p.id)}><I.Comment/>{(comments[p.id]||[]).reduce((n,c)=>n+1+(c.replies?.length||0),0)}</button>
          <button className="post-act" onClick={e=>{e.stopPropagation();openSharePanel(p,e.currentTarget);}}><I.Share/>{p.shares}</button>
          <button className={"post-act"+(savedMap[String(p.id)]?.length?" saved":"")} aria-label={savedMap[String(p.id)]?.length?"Manage saved post":"Save post"} title={savedMap[String(p.id)]?.length?"Manage saved post":"Save post"} style={{marginLeft:"auto"}} onClick={e=>{e.stopPropagation();openSavePanel(p,e.currentTarget);}}><I.Bookmark/></button>
        </div>
      </div>
    );
  }

  /* ===== PAGE ROUTER ===== */
  if(page.type==="profile"){
    return <><SocialCtx.Provider value={socialCtxValue}><ProfilePage userId={page.userId} users={users} posts={posts} comments={comments} following={following} onToggleFollow={toggleFollow} onDM={handleDM} onBack={goFeed} onGoPost={goPost} PostCardComp={PostCard}/></SocialCtx.Provider>{actionDialogElement}{actionPanels}</>;
  }
  if(page.type==="post"){
    return <><SocialCtx.Provider value={socialCtxValue}><PostView postId={page.postId} highlightCommentId={page.highlightCommentId} posts={posts} setPosts={setPosts} comments={comments} setComments={setComments} users={users} liked={liked} onToggleLike={toggleLike} onBack={goFeed} showToast={showToast} onSave={openSavePanel} onShare={openSharePanel} onEditPost={editPost} onToggleComments={togglePostComments} onDeletePost={removePost} onCopyLink={copyPostLink} onPinPost={handlePinPost} onHidePost={handleHidePost} onModerateUser={handleUserModeration} onConfirmBlock={confirmBlockUser} onReportPost={handleReportPost} onReportComment={handleReportComment}/></SocialCtx.Provider>{actionDialogElement}{actionPanels}</>;
  }
  if(page.type==="community"){
    const community=communities.find(c=>c.id===page.communityId);
    const commPosts=posts.filter(p=>p.communityId===page.communityId&&!hiddenPostIds.includes(String(p.id))&&!mutedUserIds.includes(String(p.authorId))&&!blockedUserIds.includes(String(p.authorId)));
    return <><SocialCtx.Provider value={socialCtxValue}><CommunityFeed community={community} users={users} posts={commPosts} onBack={goFeed} onToggleFollow={toggleFollowCommunity} onToggleNotif={toggleNotif} onRightRailChange={onCommunityRightRailChange} PostCardComp={PostCard} showToast={showToast} onUpdateCommunity={async (communityId, settings) => { const updated = await updateCommunitySettings(communityId, settings); setCommunities(previous => previous.map(item => item.id === communityId ? { ...item, ...updated } : item)); return updated; }} onReviewMember={reviewCommunityMember} onFetchPendingMembers={fetchPendingCommunityMembers} onNewPost={(newPost) => {
      setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, posts: (c.posts || 0) + 1 } : c));
      setPosts(prev => upsertUniquePost(prev, newPost));
    }}/></SocialCtx.Provider>{actionDialogElement}{actionPanels}</>;
  }

  return(
    <SocialCtx.Provider value={socialCtxValue}>
    <div className="main main-link">
      <div className="sub-hd">
        {[["discover","Discover"],["create","Create"],["community","Community"]].map(([k,l])=>(
          <button key={k} className={"sub-tab"+(tab===k?" on":"")} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="scroll">
        {tab==="discover"&&<>
          <div className="fbar">
            <div className="sbar"><I.Search/><input placeholder="Search posts, farmers, topics…" value={discoverSearch} onChange={e=>setDiscoverSearch(e.target.value)}/></div>
            <div className="filter-dd-anchor" ref={filterRef}>
              <button className="btn btn-g btn-sm" onClick={()=>setFilterDropOpen(v=>!v)}><I.Filter/>{discoverFilter}<I.ChevD style={{width:11,height:11,marginLeft:2}}/></button>
              {filterDropOpen&&(
                <div className="filter-dd">
                  {["All","Grains","Vegetables","Research","Jobs","Equipment"].map(c=>(
                    <button key={c} className={"filter-dd-item"+(discoverFilter===c?" on":"")} onClick={()=>{setDiscoverFilter(c);setFilterDropOpen(false);}}>
                      {discoverFilter===c&&<I.Check/>}{c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="post-feed">
            {filteredPosts.map(p=><PostCard key={p.id} p={p}/>)}
            {filteredPosts.length===0&&(
              <div className="empty"><div className="empty-ico">🔍</div><div className="empty-t">No posts found</div><div className="empty-s">Try a different search or filter</div></div>
            )}
          </div>
        </>}
        {tab==="create"&&<div style={{maxWidth:560}}>
          <p className="subsh">Share knowledge, updates, or job opportunities with the farming community.</p>
          {postCreateError&&<div className="notice social-action-error" role="alert"><I.Info/><span>{postCreateError}</span></div>}
          <div className="compose-box">
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <Av initials={profile?.initials || 'YO'} size="lg" green src={profile?.avatar_url}/>
              <textarea ref={composeInputRef} className="compose-input" placeholder="What is happening on your farm? Use #hashtags to tag topics." value={compose} onChange={e=>{setCompose(e.target.value);setPostCreateError('');}} rows={4}/>
            </div>
            {/* Live hashtag preview */}
            {(compose.match(/#([a-zA-Z0-9_]+)/g)||[]).length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10,paddingTop:8,borderTop:"1px solid var(--bd)"}}>
                <span style={{fontSize:10.5,color:"var(--t4)",fontWeight:600,marginRight:2}}>Tags:</span>
                {[...new Set((compose.match(/#([a-zA-Z0-9_]+)/g)||[]).map(t=>t.slice(1)))].map(t=>(
                  <span key={t} className="post-tag">#{t}</span>
                ))}
              </div>
            )}
            <div className="compose-foot">
              <div style={{display:"flex",gap:4}}>
                {[I.Image,I.Map,I.Globe].map((IC,i)=><button key={i} className="ib"><IC/></button>)}
              </div>
              <button className="btn btn-p" onClick={()=>submitPost(null)} disabled={!compose.trim() || (!profile?.id && !user?.id)}><I.Send/>Publish</button>
            </div>
          </div>
          <div className="notice ni"><I.Info/><span>Type #hashtags anywhere in your post — they will be automatically extracted as tags when you publish.</span></div>
          {(!profile?.id && !user?.id)&&<div className="notice ni"><I.Info/><span>Sign in to publish and interact with the community.</span></div>}
        </div>}
        {tab==="community"&&<>
          <div className="community-discovery-head">
            <div><span className="community-eyebrow">THE FIELD NETWORK</span><h1>Find your growing circle.</h1><p>Shared ground for growers, makers, and people building what comes next.</p></div>
            <button className="btn btn-p btn-sm" onClick={()=>{setCommunityCreateError('');setReqCommOpen(true);}}><I.Plus/>Start a circle</button>
          </div>
          <div className="community-discovery-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))",gap:12,marginBottom:24}}>
            {communities.map(c=>{
              const categoryHue={Crops:108,Livestock:38,Equipment:65,Market:145,Research:190,Jobs:275,Local:88};
              const accent=`hsl(${categoryHue[c.category]??116} 74% 48%)`;
              const isCommunityOwner=String(c.ownerId)===String(profile?.id||user?.id);
              return <article key={c.id} className="comm-card" style={{'--community-accent':accent}}>
                <button className="comm-card-open" onClick={()=>goCommunity(c.id)} aria-label={`Open ${c.name} community`}>
                  <div className="comm-banner" style={c.coverImageUrl?{backgroundImage:`url("${c.coverImageUrl}")`}:{background:c.bg}}>
                    <span className="comm-card-category"><I.Seedling/>{c.category||'General'}</span>
                    <span className="comm-card-privacy">{c.privacy==='private'?<I.Lock/>:<I.Globe/>}{c.privacy==='private'?'Private':'Open'}</span>
                    <span className="comm-card-mark">{c.ico}</span>
                  </div>
                  <div className="comm-body">
                    <div className="comm-name">{c.name}</div>
                    <div className="comm-description">{c.desc||'A community for sharing growing knowledge and local insight.'}</div>
                    <div className="comm-meta"><span><I.Users/>{Number(c.members||0).toLocaleString()} members</span><span><I.Comment/>{Number(c.posts||0).toLocaleString()} posts</span></div>
                  </div>
                </button>
                <div className="comm-card-actions">
                  <button className={"btn btn-sm btn-full" + (isCommunityOwner||c.followed||c.pending ? " btn-g" : " btn-p")} onClick={()=>isCommunityOwner?goCommunity(c.id):toggleFollowCommunity(c.id,c.pending?false:undefined)}>
                    {isCommunityOwner?'Manage community':c.followed ? <><I.Check/>Following</> : c.pending ? 'Cancel request' : <><I.Plus/>{c.privacy==='private'||c.joinApproval?'Request to join':'Join community'}</>}
                  </button>
                  <button className="comm-card-view" onClick={()=>goCommunity(c.id)} aria-label={`View ${c.name}`}><I.ArrowR/></button>
                </div>
              </article>;
            })}
          </div>

          <div className="sh">Featured Members</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:8}}>
            {Object.values(users).filter(u=>String(u.id)!==String(currentUserId)).map(u=>(
              <div key={u.id} className="card card-p" style={{textAlign:"center",cursor:"pointer"}} onClick={()=>goProfile(u.id)}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Av initials={u.initials} size="lg" green src={u.avatarUrl}/></div>
                <div style={{fontWeight:700,fontSize:12.5,color:"var(--t1)",marginBottom:2}}>{u.name}</div>
                <div style={{fontSize:11,color:"var(--t4)",marginBottom:9}}>{u.role}</div>
                <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                  <button className={"btn btn-sm"+(following[u.id]?" btn-g":" btn-p")} style={{flex:1}} onClick={()=>toggleFollow(u.id)}>{following[u.id]?"Following":"Follow"}</button>
                  <button className="btn btn-g btn-sm" onClick={()=>handleDM(u)}><I.Msg/></button>
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* Request community */}
      <Modal open={reqCommOpen} onClose={()=>{setReqCommOpen(false);setCommunityCreateError('');setNewCommunityName('');setNewCommunityFocus('');setNewCommunityDesc('');setNewCommunityIcon('🌱');}} title="Create a Community"
        footer={<><button className="btn btn-g" onClick={()=>{setReqCommOpen(false);setCommunityCreateError('');setNewCommunityName('');setNewCommunityFocus('');setNewCommunityDesc('');setNewCommunityIcon('🌱');}}>Cancel</button><button className="btn btn-p" onClick={submitCommunityRequest} disabled={creatingCommunity||!newCommunityName.trim()}><I.Check/>{creatingCommunity ? 'Creating...' : 'Create Community'}</button></>}>
        <div className="notice nw"><I.Info/><span>A community is created for your signed-in account. If setup or permissions block it, the error will appear here.</span></div>
        {communityCreateError&&<div className="notice social-action-error" role="alert"><I.Info/><span>{communityCreateError}</span></div>}
        <div className="form-g"><label className="label">Community Name</label><input className="field" placeholder="e.g. Nigerian Maize Growers" value={newCommunityName} onChange={e=>{setNewCommunityName(e.target.value);setCommunityCreateError('');}}/></div>
        <div className="form-g"><label className="label">Focus Area</label><input className="field" placeholder="e.g. Maize, Irrigation, AgriTech…" value={newCommunityFocus} onChange={e=>setNewCommunityFocus(e.target.value)}/></div>
        <div className="form-g"><label className="label">Community Icon</label><input className="field" placeholder="Emoji icon" value={newCommunityIcon} onChange={e=>setNewCommunityIcon(e.target.value)}/></div>
        <div className="form-g"><label className="label">Description</label><textarea className="field textarea" placeholder="What is this community about?" value={newCommunityDesc} onChange={e=>setNewCommunityDesc(e.target.value)}/></div>
      </Modal>

      {actionPanels}
      {actionDialogElement}
    </div>
    </SocialCtx.Provider>
  );
}

/* ============================================================
   PROFILE PAGE — X-style: bio top, Posts/Replies tabs
   ============================================================ */

export default LinkSection;
