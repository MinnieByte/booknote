// 1. 直接在 index.js 里初始化 Supabase（不依赖外部声明）
const supabaseUrl = 'https://gujcwodujvaznjleghys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1amN3b2R1anZhem5qbGVnaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDYwODUsImV4cCI6MjA3ODQyMjA4NX0.Lx5YGawgrovZK57UkGqoCG23A4NXZqoogQ6hYr7IcIY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. 等待页面加载完成
document.addEventListener('DOMContentLoaded', async () => {
  await loadRecentBooks();
  await loadCategories();
});

// 3. 加载最近在读书籍
async function loadRecentBooks() {
  const container = document.getElementById('recent-books');
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', '在读')
      .limit(2);

    if (error) throw error;
    container.innerHTML = '';

    if (data.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500">暂无在读书籍</div>';
      return;
    }

    data.forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.className = 'bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow';
      
      // 改用picsum.photos（高质量随机图）+ 书名水印，更美观
      const coverUrl = book.cover_url && !book.cover_url.includes('doubanio.com') 
        ? book.cover_url 
        : `https://picsum.photos/seed/${encodeURIComponent(book.title)}/300/400`; // 用书名做种子，保证同一本书封面固定

      bookCard.innerHTML = `
        <div class="md:flex">
          <div class="md:w-1/3 relative">
            <img src="${coverUrl}" 
                 alt="${book.title}" 
                 class="w-full h-48 md:h-full object-cover">
            <!-- 叠加书名水印（更有辨识度） -->
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span class="text-white text-xl font-bold">${book.title}</span>
            </div>
          </div>
          <div class="p-4 md:w-2/3">
            <h3 class="text-xl font-semibold">${book.title}</h3>
            <p class="text-gray-600">作者：${book.author}</p>
            <p class="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">${book.status}</p>
            <a href="notes.html?book_id=${book.id}" class="mt-4 inline-block text-blue-600">查看笔记 →</a>
          </div>
        </div>
      `;
      container.appendChild(bookCard);
    });

  } catch (error) {
    container.innerHTML = `<div class="text-center text-red-500">加载失败：${error.message}</div>`;
    console.error('加载最近在读书籍失败：', error);
  }
}

// 4. 加载分类
async function loadCategories() {
  const container = document.getElementById('categories');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(4);

    if (error) throw error;
    container.innerHTML = '';

    if (data.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500">暂无分类</div>';
      return;
    }

    data.forEach(category => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md cursor-pointer';
      categoryCard.innerHTML = `
        <h3 class="text-lg font-medium">${category.name}</h3>
        <p class="text-sm text-gray-500 mt-2">点击查看相关书籍</p>
      `;
      categoryCard.addEventListener('click', () => {
        window.location.href = `books.html?category_id=${category.id}`;
      });
      container.appendChild(categoryCard);
    });

  } catch (error) {
    container.innerHTML = `<div class="text-center text-red-500">加载失败：${error.message}</div>`;
    console.error('加载分类失败：', error);
  }
}