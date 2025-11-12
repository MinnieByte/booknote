// 1. 独立初始化 Supabase
const supabaseUrl = 'https://gujcwodujvaznjleghys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1amN3b2R1anZhem5qbGVnaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDYwODUsImV4cCI6MjA3ODQyMjA4NX0.Lx5YGawgrovZK57UkGqoCG23A4NXZqoogQ6hYr7IcIY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. 页面加载后执行
document.addEventListener('DOMContentLoaded', async () => {
  // 加载分类列表
  await loadCategories();
  // 加载书籍（优先用URL里的分类ID，否则加载全部）
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category_id');
  await loadBooks(categoryId || 'all');
});

// 3. 加载分类列表（适配你的 categories-list 容器）
async function loadCategories() {
  const container = document.getElementById('categories-list');
  // 先找到“加载中”元素并清空
  const loadingEl = container.querySelector('.text-gray-500');
  if (loadingEl) loadingEl.remove();

  try {
    const { data: categories, error } = await supabase.from('categories').select('*');
    if (error) throw error;

    // 渲染分类按钮
    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'category-filter w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors';
      btn.dataset.category = category.id; // 存分类ID
      btn.textContent = category.name;
      // 点击分类筛选书籍
      btn.addEventListener('click', () => {
        // 先移除其他分类的选中状态
        container.querySelectorAll('.category-filter').forEach(el => {
          el.classList.remove('text-blue-600', 'font-medium');
          el.classList.add('text-gray-700');
        });
        // 标记当前分类为选中
        btn.classList.add('text-blue-600', 'font-medium');
        btn.classList.remove('text-gray-700');
        // 加载对应分类的书籍
        loadBooks(category.id);
      });
      container.appendChild(btn);
    });

  } catch (error) {
    container.innerHTML += '<div class="text-red-500 text-center mt-2">加载分类失败</div>';
    console.error('加载分类错误:', error);
  }
}

// 4. 加载书籍列表（适配你的 books-container 容器）
async function loadBooks(categoryId) {
  const container = document.getElementById('books-container');
  container.innerHTML = '<div class="col-span-full text-center text-gray-500">加载中...</div>';

  try {
    let query = supabase.from('books').select('*');
    // 筛选分类（all 则不筛选）
    if (categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const { data: books, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    container.innerHTML = '';
    if (books.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">暂无书籍</div>';
      return;
    }

    // 渲染书籍卡片
    books.forEach(book => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow';
      
      // 封面图逻辑：改用picsum高质量图+书名水印
      const coverUrl = book.cover_url && !book.cover_url.includes('doubanio.com') 
        ? book.cover_url 
        : `https://picsum.photos/seed/${encodeURIComponent(book.title)}/300/400`;

      card.innerHTML = `
        <div class="md:flex">
          <!-- 封面图（带书名水印） -->
          <div class="md:w-1/3 relative">
            <img src="${coverUrl}" 
                 alt="${book.title}" 
                 class="w-full h-48 md:h-full object-cover">
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span class="text-white text-xl font-bold">${book.title}</span>
            </div>
          </div>
          <!-- 书籍信息 -->
          <div class="p-4 md:w-2/3">
            <h3 class="text-xl font-semibold text-gray-900">${book.title}</h3>
            <p class="text-gray-600 mt-1">作者：${book.author}</p>
            <!-- 阅读状态标签 -->
            <p class="mt-2 inline-block px-3 py-1 
              ${book.status === '已读' ? 'bg-green-100 text-green-800' : 
                book.status === '在读' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100 text-gray-800'} 
              rounded-full text-sm">
              ${book.status}
            </p>
            <!-- 查看笔记链接 -->
            <a href="notes.html?book_id=${book.id}" class="mt-4 inline-block text-blue-600 hover:text-blue-800 transition-colors">
              查看笔记 →
            </a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = '<div class="col-span-full text-center text-red-500">加载失败，请刷新页面重试</div>';
    console.error('加载书籍错误:', error);
  }
}

// 给“全部书籍”按钮绑定事件
document.querySelector('.category-filter[data-category="all"]').addEventListener('click', () => {
  // 标记“全部书籍”为选中状态
  document.querySelectorAll('.category-filter').forEach(el => {
    el.classList.remove('text-blue-600', 'font-medium');
    el.classList.add('text-gray-700');
  });
  document.querySelector('.category-filter[data-category="all"]').classList.add('text-blue-600', 'font-medium');
  // 加载全部书籍
  loadBooks('all');
});