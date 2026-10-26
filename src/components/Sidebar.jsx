import React from 'react';
import I from '../icons/icons.jsx';
import '../styles/sidebar.css';

export default function Sidebar({ navItems, section, setSection, onCreatePost }) {
  return (
    <nav className='sidebar sidebar-v2' aria-label='Primary navigation'>
      <div className='nav-lbl'>Navigate</div>
      {navItems.map(item => (
        <button
          key={item.k}
          className={'nav-item' + (section === item.k ? ' on' : '')}
          onClick={() => setSection(item.k)}
        >
          <span className='nav-ico-wrap'><item.ic/></span>
          <span className='nav-item-text'>{item.l}</span>
          {item.badge && <span className='nav-badge'>{item.badge}</span>}
        </button>
      ))}
      <div className='nav-spacer' />
      <div className='nav-bottom-group'>
        <button type='button' className='nav-item nav-item-post' onClick={onCreatePost}>
          <span className='nav-ico-wrap'><I.Plus/></span>
          <span className='nav-item-text'>Post</span>
        </button>
        <div className='nav-div' role='separator' />
        <button
          type='button'
          className={'nav-item nav-item-account' + (section === 'account' ? ' on' : '')}
          onClick={() => setSection('account')}
        >
          <span className='nav-ico-wrap'><I.User/></span>
          <span className='nav-item-text'>Account</span>
        </button>
      </div>
    </nav>
  );
}
