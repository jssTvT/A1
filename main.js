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
  
  // --- 正文及删帖逻辑 ---
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
  
  // --- 渲染评论区 ---
  // 关键点：这里必须定义 repliesContainer
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
