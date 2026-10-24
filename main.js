let currentBoard = '全部';
let currentProfileName = '';
let globalForumData = []; 

// 初始化论坛
function initForum(data) {
  globalForumData = data;
  renderBoardNav();
  renderPostList();
  
  const searchInput = document.getElementById('post-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderPostList(); 
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.dataset.theme === 'dark';
  if (isDark) {
    root.removeAttribute('data-theme');
    document.getElementById('themeBtn').innerText = '夜间模式';
  } else {
    root.dataset.theme = 'dark';
    document.getElementById('themeBtn').innerText = '日间模式';
  }
}

function switchView(viewId) {
  ['view-list', 'view-detail', 'view-profile'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
  window.scrollTo(0, 0);
}

function backTo(targetView) {
  if (targetView === 'list') {
    switchView('view-list');
  } else if (targetView === 'profile') {
    openProfile(currentProfileName); 
  }
}

function renderBoardNav() {
  const nav = document.getElementById('board-nav');
  if (!nav) return; 
  nav.innerHTML = '';
  const boards = ['全部', '校园公告', '树洞', '吹水', '学习资料', '创作区', '失物招领'];
  
  boards.forEach(board => {
    const btn = document.createElement('button');
    btn.className = `board-btn ${board === currentBoard ? 'active' : ''}`;
    btn.innerText = board;
    btn.onclick = () => {
      currentBoard = board;
      renderBoardNav();
      renderPostList();
    };
    nav.appendChild(btn);
  });
}

function renderPostList() {
  const list = document.getElementById('post-list');
  if (!list) return; 
  list.innerHTML = '';
  
  const searchInput = document.getElementById('post-search');
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filtered = globalForumData.filter(p => {
    const matchBoard = (currentBoard === '全部' || p.board === currentBoard);
    const matchVisibility = p.visibility === 'public';
    const matchKeyword = keyword === '' || 
                         p.title.toLowerCase().includes(keyword) || 
                         p.content.toLowerCase().includes(keyword);
    return matchBoard && matchVisibility && matchKeyword;
  });
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="muted" style="text-align:center; padding:20px;">没有找到相关帖子</div>';
    return;
  }

  filtered.forEach(post => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.onclick = () => openDetail(post.id);
    
    const isAnon = post.author === '匿名';
    const authorHtml = isAnon 
      ? `<span class="author-anon">匿名</span>` 
      : `<span class="author-name" onclick="openProfile('${post.author}', event)">${post.author}</span>`;

    let tagHtml = '';
    if (post.isDeleted) {
      tagHtml = `<div class="post-tag tag-deleted">已删除</div>`;
    } else if (post.tag) {
      tagHtml = `<div class="post-tag ${post.tagClass || ''}">${post.tag}</div>`;
    }

    item.innerHTML = `
      <div class="post-title-row">
        <div class="post-title">${post.title}</div>
        ${tagHtml}
      </div>
      <div class="meta">
        ${authorHtml}
        <span>${post.time}</span>
        <span>回复 ${post.replies.length}</span>
      </div>
    `;
    list.appendChild(item);
  });
}

function openProfile(authorName, e) {
  if (e) e.stopPropagation();
  if (authorName === '匿名') return;

  currentProfileName = authorName;
  document.getElementById('profile-name').innerHTML = `${authorName} 的主页`;
  
  const profileList = document.getElementById('profile-post-list');
  profileList.innerHTML = '';
  
  const userPosts = globalForumData.filter(p => p.author === authorName);
  
  if (userPosts.length === 0) {
    profileList.innerHTML = '<div class="muted">TA还没有发过帖子。</div>';
  } else {
    userPosts.forEach(post => {
      const isPublic = post.visibility === 'public';
      const item = document.createElement('div');
      
      if (isPublic) {
        item.className = 'post-item';
        item.onclick = () => openDetail(post.id, 'profile');
        
        let tagHtml = post.isDeleted ? `<div class="post-tag tag-deleted">已删除</div>` : `<div class="post-tag">公开</div>`;
        
        item.innerHTML = `
          <div class="post-title-row">
            <div class="post-title">${post.title}</div>
            ${tagHtml}
          </div>
          <div class="meta">
            <span>${post.time}</span>
            <span>回复 ${post.replies.length}</span>
          </div>
        `;
      } else {
        item.className = 'post-item locked';
        item.innerHTML = `
          <div class="post-title-row">
            <div class="post-title">🔒 ${post.title.replace('【仅好友可见】', '')}</div>
            <div class="post-tag" style="background:#555; color:#aaa;">仅好友可见</div>
          </div>
          <div class="meta">
            <span>${post.time}</span>
            <span>无权查看</span>
          </div>
        `;
      }
      profileList.appendChild(item);
    });
  }

  switchView('view-profile');
}

function openDetail(id, fromWhere = 'list') {
  const post = globalForumData.find(p => p.id === id);
  if (!post) return;

  document.querySelector('#view-detail .btn-back').onclick = () => {
    if (fromWhere === 'profile') backTo('profile');
    else switchView('view-list');
  };

  document.getElementById('detail-title').innerText = post.title;
  
  const isAnon = post.author === '匿名';
  const authorHtml = isAnon 
    ? `<span class="author-anon">楼主：匿名</span>` 
    : `<span class="author-name" onclick="openProfile('${post.author}', event)">楼主：${post.author}</span>`;

  document.getElementById('detail-meta').innerHTML = `
    ${authorHtml}
    <span>${post.time}</span>
    <span class="badge" style="margin-left:auto;">${post.board}</span>
  `;
  
  const detailContent = document.getElementById('detail-content');
  detailContent.className = post.isDeleted ? 'post-body content-muted' : 'post-body';
  
  if (post.isDeleted) {
    detailContent.innerHTML = `
      <div class="deleted-banner">
        🚫 该贴因违反版规已被管理员删除，以下内容已被折叠，仅供参考。
      </div>
      ${post.content}
    `;
    document.getElementById('detail-reply-title').innerText = `历史回复 (${post.replies.length})`;
  } else {
    detailContent.innerHTML = post.content;
    document.getElementById('detail-reply-title').innerText = `全部回复 (${post.replies.length})`;
  }
  
  const repliesContainer = document.getElementById('detail-replies');
  repliesContainer.innerHTML = '';
  
  if (post.replies.length === 0) {
    repliesContainer.innerHTML = '<div class="muted" style="font-size:14px;">暂无回复</div>';
  } else {
    post.replies.forEach((reply, index) => {
      const div = document.createElement('div');
      div.className = `reply ${reply.isDeleted ? 'deleted' : ''}`;
      
      const isReplyAnon = reply.author === '匿名';
      const replyAuthorHtml = isReplyAnon 
        ? `<span class="author-anon">匿名</span>` 
        : `<span class="author-name" onclick="openProfile('${reply.author}', event)">${reply.author}</span>`;

      div.innerHTML = `
        <div class="reply-meta">
          ${replyAuthorHtml}
          <span class="muted">${reply.time}</span>
          <span class="reply-floor">#${index + 1}</span>
        </div>
        <p>${reply.text}</p>
      `;
      repliesContainer.appendChild(div);
    });
  }

  switchView('view-detail');
}
