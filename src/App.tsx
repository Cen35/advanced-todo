import { FormEvent, useEffect, useMemo, useState } from 'react'

type Priority = '高' | '中' | '低'
type StatusFilter = '全部' | '进行中' | '已完成'
type Todo = {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  dueDate: string
  completed: boolean
  createdAt: string
}

const STORAGE_KEY = 'qingzhou-todos-v1'
const initialTodos: Todo[] = [
  { id: 'demo-1', title: '完成课程实践作业', description: '整理四个项目的截图和访问链接', category: '学习', priority: '高', dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), completed: false, createdAt: new Date().toISOString() },
  { id: 'demo-2', title: '复习 React Hooks', description: '梳理 useState 和 useEffect 的使用场景', category: '学习', priority: '中', dueDate: '', completed: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
]

const readTodos = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) as Todo[] : initialTodos
  } catch { return initialTodos }
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(readTodos)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('学习')
  const [priority, setPriority] = useState<Priority>('中')
  const [dueDate, setDueDate] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [priorityFilter, setPriorityFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全部')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)), [todos])

  const categories = useMemo(() => ['全部', ...Array.from(new Set(todos.map(todo => todo.category)))], [todos])
  const visibleTodos = useMemo(() => todos.filter(todo => {
    const word = query.trim().toLowerCase()
    return (!word || `${todo.title} ${todo.description}`.toLowerCase().includes(word))
      && (categoryFilter === '全部' || todo.category === categoryFilter)
      && (priorityFilter === '全部' || todo.priority === priorityFilter)
      && (statusFilter === '全部' || (statusFilter === '已完成' ? todo.completed : !todo.completed))
  }).sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt.localeCompare(a.createdAt)), [todos, query, categoryFilter, priorityFilter, statusFilter])

  const completed = todos.filter(todo => todo.completed).length
  const completionRate = todos.length ? Math.round(completed / todos.length * 100) : 0

  function clearForm() {
    setEditingId(null); setTitle(''); setDescription(''); setCategory('学习'); setPriority('中'); setDueDate('')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    if (editingId) {
      setTodos(items => items.map(todo => todo.id === editingId ? { ...todo, title: title.trim(), description: description.trim(), category: category.trim() || '其他', priority, dueDate } : todo))
    } else {
      setTodos(items => [{ id: crypto.randomUUID(), title: title.trim(), description: description.trim(), category: category.trim() || '其他', priority, dueDate, completed: false, createdAt: new Date().toISOString() }, ...items])
    }
    clearForm()
  }

  function edit(todo: Todo) {
    setEditingId(todo.id); setTitle(todo.title); setDescription(todo.description); setCategory(todo.category); setPriority(todo.priority); setDueDate(todo.dueDate)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="轻舟待办首页"><span className="brand-mark">✓</span>轻舟待办</a>
        <span className="today">{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}</span>
      </header>

      <section className="hero" id="top">
        <div><p className="eyebrow">ADVANCED TODO</p><h1>把重要的事，<br /><em>稳稳推进。</em></h1><p>分类、筛选、搜索与统计都在这里，数据只保存在你的浏览器中。</p></div>
        <div className="stats" aria-label="任务统计">
          <div><strong>{todos.length}</strong><span>全部任务</span></div>
          <div><strong>{todos.length - completed}</strong><span>待完成</span></div>
          <div><strong>{completionRate}%</strong><span>完成率</span></div>
        </div>
      </section>

      <section className="workspace">
        <form className="task-form card" onSubmit={submit}>
          <div className="section-heading"><div><span>新任务</span><h2>{editingId ? '编辑待办事项' : '今天要做什么？'}</h2></div>{editingId && <button type="button" className="text-button" onClick={clearForm}>取消编辑</button>}</div>
          <label>任务标题<input value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：完成课程作业" maxLength={60} required /></label>
          <label>任务描述<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="补充一些细节……" rows={3} /></label>
          <div className="form-grid">
            <label>分类<input value={category} onChange={e => setCategory(e.target.value)} placeholder="学习" /></label>
            <label>优先级<select value={priority} onChange={e => setPriority(e.target.value as Priority)}><option>高</option><option>中</option><option>低</option></select></label>
            <label>截止日期<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></label>
          </div>
          <button className="primary" type="submit">{editingId ? '保存修改' : '＋ 添加任务'}</button>
        </form>

        <section className="list-panel card">
          <div className="section-heading"><div><span>任务清单</span><h2>保持节奏</h2></div><small>{visibleTodos.length} 条结果</small></div>
          <div className="filters">
            <label className="search"><span>⌕</span><input aria-label="搜索任务" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索标题或描述" /></label>
            <select aria-label="按状态筛选" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}><option>全部</option><option>进行中</option><option>已完成</option></select>
            <select aria-label="按分类筛选" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select>
            <select aria-label="按优先级筛选" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option>全部</option><option>高</option><option>中</option><option>低</option></select>
          </div>
          <div className="todo-list">
            {visibleTodos.length === 0 && <div className="empty"><span>○</span><h3>这里暂时是空的</h3><p>换一个筛选条件，或添加一条新任务。</p></div>}
            {visibleTodos.map(todo => <article className={`todo ${todo.completed ? 'done' : ''}`} key={todo.id}>
              <button className="check" aria-label={todo.completed ? '标记为未完成' : '标记为已完成'} onClick={() => setTodos(items => items.map(item => item.id === todo.id ? { ...item, completed: !item.completed } : item))}>{todo.completed ? '✓' : ''}</button>
              <div className="todo-body"><div className="todo-title"><h3>{todo.title}</h3><span className={`priority p-${todo.priority}`}>{todo.priority}优先</span></div>{todo.description && <p>{todo.description}</p>}<div className="meta"><span>{todo.category}</span>{todo.dueDate && <span className={new Date(`${todo.dueDate}T23:59:59`) < new Date() && !todo.completed ? 'overdue' : ''}>截止 {todo.dueDate}</span>}</div></div>
              <div className="actions"><button onClick={() => edit(todo)}>编辑</button><button className="danger" onClick={() => { if (confirm('确定删除这条任务吗？')) setTodos(items => items.filter(item => item.id !== todo.id)) }}>删除</button></div>
            </article>)}
          </div>
        </section>
      </section>
      <footer>轻舟待办 · 所有数据仅保存在当前浏览器</footer>
    </main>
  )
}
