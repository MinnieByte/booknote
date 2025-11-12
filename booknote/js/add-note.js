// 1. 独立初始化 Supabase
const supabaseUrl = 'https://gujcwodujvaznjleghys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1amN3b2R1anZhem5qbGVnaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDYwODUsImV4cCI6MjA3ODQyMjA4NX0.Lx5YGawgrovZK57UkGqoCG23A4NXZqoogQ6hYr7IcIY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. 页面加载后执行
document.addEventListener('DOMContentLoaded', async () => {
  await loadBookSelect();
  // 绑定表单提交事件（用表单的ID）
  document.getElementById('add-note-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // 阻止表单默认提交
    await saveNote();
  });
});

// 3. 加载书籍下拉框（使用正确的ID：book-select）
async function loadBookSelect() {
  // 关键修改：用 getElementById 匹配页面中的 book-select
  const selectEl = document.getElementById('book-select');
  if (!selectEl) {
    console.error('未找到ID为book-select的下拉框');
    return;
  }

  selectEl.innerHTML = '<option value="">加载中...</option>';

  try {
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title') // 只查询需要的字段：书籍ID和标题
      .order('title'); // 按书名排序

    if (error) throw error;

    selectEl.innerHTML = '<option value="">请选择书籍</option>'; // 重置默认选项

    if (books.length === 0) {
      selectEl.innerHTML += '<option value="" disabled>暂无书籍数据</option>';
      return;
    }

    // 渲染书籍选项
    books.forEach(book => {
      const option = document.createElement('option');
      option.value = book.id; // 选项值为书籍ID
      option.textContent = book.title; // 显示书名
      selectEl.appendChild(option);
    });

  } catch (error) {
    selectEl.innerHTML = '<option value="">加载失败，请刷新页面</option>';
    console.error('加载书籍列表错误:', error);
  }
}

// 4. 保存笔记
async function saveNote() {
  // 获取表单数据（用ID匹配页面元素）
  const bookId = document.getElementById('book-select').value;
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');

  // 隐藏之前的提示
  successMsg.classList.add('hidden');
  errorMsg.classList.add('hidden');

  // 表单校验
  if (!bookId) {
    alert('请选择书籍');
    return;
  }
  if (!title) {
    alert('请输入笔记标题');
    return;
  }
  if (!content) {
    alert('请输入笔记内容');
    return;
  }

  try {
    // 插入笔记到Supabase的notes表
    const { error } = await supabase.from('notes').insert([
      {
        book_id: bookId,
        title: title,
        content: content,
        created_at: new Date().toISOString() // 记录当前时间
      }
    ]);

    if (error) throw error;

    // 显示成功提示
    successMsg.classList.remove('hidden');
    // 3秒后隐藏提示
    setTimeout(() => successMsg.classList.add('hidden'), 3000);
    // 重置表单
    document.getElementById('add-note-form').reset();

  } catch (error) {
    // 显示错误提示
    errorMsg.textContent = `添加失败：${error.message}`;
    errorMsg.classList.remove('hidden');
    setTimeout(() => errorMsg.classList.add('hidden'), 3000);
    console.error('保存笔记错误:', error);
  }
}