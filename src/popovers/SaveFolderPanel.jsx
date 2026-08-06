import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import { Modal } from '../components/index.jsx';

function SaveFolderPanel({open,onClose,post,savedMap,onToggleSave,showToast}){
  const [folders,setFolders]=useState([]);
  const [newFolderOpen,setNewFolderOpen]=useState(false);
  const [newFolderName,setNewFolderName]=useState("");
  const postId=post?.id;
  const postSaves=savedMap[postId]||[];

  function folderCount(fid){
    return Object.values(savedMap).filter(arr=>arr.includes(fid)).length;
  }
  function createFolder(){
    if(!newFolderName.trim()) return;
    const colors=["var(--blue)","var(--teal)","var(--gold)","var(--purple)","var(--g400)","var(--red)"];
    const f={id:"f"+Date.now(),name:newFolderName.trim(),ico:"📁",color:colors[Math.floor(Math.random()*colors.length)]};
    setFolders(p=>[...p,f]);
    setNewFolderName("");setNewFolderOpen(false);
    showToast("ok","Folder created!");
  }

  return(
    <Modal open={open} onClose={onClose} title="Save to collection" sheet
      footer={<button className="btn btn-p btn-full" onClick={onClose}><I.Check/>Done</button>}>
      {post&&(
        <div className="save-post-preview">
          <span className="save-post-ico">{post.image||"📝"}</span>
          <span className="save-post-label">Post</span>
          <span className="save-post-text">{post.body}</span>
        </div>
      )}
      {folders.map(f=>{
        const saved=postSaves.includes(f.id);
        const count=folderCount(f.id);
        return(
          <div key={f.id} className={"folder-row"+(saved?" saved":"")} onClick={()=>onToggleSave(postId,f.id)}>
            <div className="folder-ico" style={{color:f.color,background:"color-mix(in srgb, "+f.color+" 14%, transparent)"}}>{f.ico}</div>
            <div className="folder-info"><div className="folder-name">{f.name}</div><div className="folder-count">{count===0?"Empty":count+" saved"}</div></div>
            <div className="folder-check">{saved&&<I.Check/>}</div>
          </div>
        );
      })}
      {newFolderOpen?
        <div style={{display:"flex",gap:7,marginTop:8}}>
          <input className="field" placeholder="Folder name" value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createFolder()} autoFocus/>
          <button className="btn btn-p btn-sm" onClick={createFolder}><I.Check/></button>
        </div>:
        <button className="btn btn-g btn-full" style={{marginTop:6,borderStyle:"dashed"}} onClick={()=>setNewFolderOpen(true)}><I.Plus/>New Collection</button>
      }
    </Modal>
  );
}

/* ============================================================
   SHARE PANEL — powerful sharing mechanism
   ============================================================ */

export default SaveFolderPanel;
