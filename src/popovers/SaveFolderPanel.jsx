import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import AnchoredPopover from '../components/AnchoredPopover.jsx';

function SaveFolderPanel({open,onClose,anchor,post,collections=[],savedMap,onToggleSave,onCreateCollection,showToast}){
  const [newFolderOpen,setNewFolderOpen]=useState(false);
  const [newFolderName,setNewFolderName]=useState("");
  const [saving,setSaving]=useState(false);
  const postId=post?.id;
  const postSaves=savedMap[String(postId)]||[];

  function folderCount(fid){
    return Object.values(savedMap).filter(arr=>arr.includes(fid)).length;
  }
  async function createFolder(){
    if(!newFolderName.trim()) return;
    setSaving(true);
    try {
      await onCreateCollection(newFolderName.trim());
      setNewFolderName("");setNewFolderOpen(false);
      showToast("ok","Collection created.");
    } catch (error) {
      showToast("error",error.message || "Unable to create collection.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSave(collectionId){
    setSaving(true);
    try { await onToggleSave(postId,collectionId); }
    catch { /* The parent reports persistence errors to the user. */ }
    finally { setSaving(false); }
  }

  return(
    <AnchoredPopover open={open} anchor={anchor} onClose={onClose} title="Save to collection" className="save-folder-popover">
      <div className="anchored-popover-body">
      {post&&(
        <div className="save-post-preview">
          <span className="save-post-ico">{post.image||"📝"}</span>
          <span className="save-post-label">Post</span>
          <span className="save-post-text">{post.body}</span>
        </div>
      )}
      {collections.map(f=>{
        const saved=postSaves.includes(f.id);
        const count=folderCount(f.id);
        return(
          <button key={f.id} type="button" className={"folder-row"+(saved?" saved":"")} onClick={()=>toggleSave(f.id)} disabled={saving}>
            <div className="folder-ico" style={{color:f.color,background:"color-mix(in srgb, "+f.color+" 14%, transparent)"}}>{f.ico||'📁'}</div>
            <div className="folder-info"><div className="folder-name">{f.name}</div><div className="folder-count">{count===0?"Empty":count+" saved"}</div></div>
            <div className="folder-check">{saved&&<I.Check/>}</div>
          </button>
        );
      })}
      {!collections.length&&<div className="empty"><div className="empty-t">No collections yet</div><div className="empty-s">Create a collection, then save this post to it.</div></div>}
      {newFolderOpen?
        <div style={{display:"flex",gap:7,marginTop:8}}>
          <input className="field" placeholder="Folder name" value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createFolder()} autoFocus/>
          <button className="btn btn-p btn-sm" onClick={createFolder} disabled={saving||!newFolderName.trim()}><I.Check/></button>
        </div>:
        <button className="btn btn-g btn-full" style={{marginTop:6,borderStyle:"dashed"}} onClick={()=>setNewFolderOpen(true)}><I.Plus/>New Collection</button>
      }
      </div>
      <footer className="anchored-popover-footer">
        <button className="btn btn-p btn-full" onClick={onClose}><I.Check/>Done</button>
      </footer>
    </AnchoredPopover>
  );
}

/* ============================================================
   SHARE PANEL — powerful sharing mechanism
   ============================================================ */

export default SaveFolderPanel;
