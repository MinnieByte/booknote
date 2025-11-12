// 1. 独立初始化 Supabase
const supabaseUrl = 'https://gujcwodujvaznjleghys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1amN3b2R1anZhem5qbGVnaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDYwODUsImV4cCI6MjA3ODQyMjA4NX0.Lx5YGawgrovZK57UkGqoCG23A4NXZqoogQ6hYr7IcIY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. 页面加载后执行
document.addEventListener('DOMContentLoaded', async () => {
  // 获取URL中的book_id
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('book_id');
  
  if (!bookId) {
    showError('缺少书籍ID');
    return;
  }

  // 加载书籍信息和笔记
  await loadBookInfo(bookId);
  await loadNotes(bookId);
});

// 3. 加载书籍信息
async function loadBookInfo(bookId) {
  const bookInfoEl = document.getElementById('book-info'); // 假设书籍信息容器ID是book-info
  try {
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single(); // 只取一条数据

    if (error) throw error;

    // 渲染书籍信息（根据你的页面结构调整）
    bookInfoEl.innerHTML = `
      <h1 class="text-2xl font-bold">${book.title}</h1>
      <p class="text-gray-600">作者：${book.author}</p>
      <p class="text-gray-600">状态：${book.status}</p>
    `;
  } catch (error) {
    bookInfoEl.innerHTML = `
      <div class="text-center">
        <h2 class="text-red-500 font-bold">错误</h2>
        <p>加载书籍信息失败</p>
        <a href="books.html" class="text-blue-600">← 返回书籍列表</a>
      </div>
    `;
    console.error('加载书籍信息错误:', error);
  }
}

// 4. 加载该书籍的笔记
async function loadNotes(bookId) {
  const notesListEl = document.getElementById('notes-list'); // 假设笔记列表容器ID是notes-list
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false }); // 按时间倒序

    if (error) throw error;

    if (notes.length === 0) {
      notesListEl.innerHTML = '<p class="text-gray-500 text-center">暂无笔记</p>';
      return;
    }

    // 渲染笔记列表
    notesListEl.innerHTML = '';
    notes.forEach(note => {
      const noteCard = document.createElement('div');
      noteCard.className = 'bg-white rounded-lg shadow-sm border p-4 mb-4';
      noteCard.innerHTML = `
        <h3 class="font-semibold text-lg">${note.title}</h3>
        <p class="text-gray-600 mt-2">${note.content}</p>
        <p class="text-sm text-gray-500 mt-3">创建时间：${new Date(note.created_at).toLocaleString()}</p>
      `;
      notesListEl.appendChild(noteCard);
    });
  } catch (error) {
    notesListEl.innerHTML = '<p class="text-red-500 text-center">加载笔记失败</p>';
    console.error('加载笔记错误:', error);
  }
}

// 错误提示工具函数
function showError(msg) {
  const errorEl = document.createElement('div');
  errorEl.className = 'text-center text-red-500';
  errorEl.innerHTML = `
    <h2 class="font-bold">错误</h2>
    <p>${msg}</p>
    <a href="books.html" class="text-blue-600">← 返回书籍列表</a>
  `;
  document.body.appendChild(errorEl);
}