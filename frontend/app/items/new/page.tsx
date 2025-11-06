'use client'
import { useState } from 'react'
import { useI18n } from '../../../components/I18nProviderClient'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }
}

const categories = [
  { value: 'phone', key: 'post.categories.phone', icon: '📱' },
  { value: 'computer', key: 'post.categories.computer', icon: '💻' },
  { value: 'clothing', key: 'post.categories.clothing', icon: '👕' },
  { value: 'sports', key: 'post.categories.sports', icon: '⚽' },
  { value: 'beauty', key: 'post.categories.beauty', icon: '💄' },
  { value: 'furniture', key: 'post.categories.furniture', icon: '🛋️' },
  { value: 'books', key: 'post.categories.books', icon: '📚' },
  { value: 'games', key: 'post.categories.games', icon: '🎮' },
  { value: 'other', key: 'post.categories.other', icon: '📦' }
]

const conditions = [
  { value: 'new', key: 'post.conditions.new' },
  { value: 'like_new', key: 'post.conditions.like_new' },
  { value: 'good', key: 'post.conditions.good' },
  { value: 'fair', key: 'post.conditions.fair' },
  { value: 'poor', key: 'post.conditions.poor' }
]

export default function NewItemPage() {
  const [form, setForm] = useState({ 
    title:'', 
    description:'', 
    price:'', 
    category:'', 
    condition:'',
    image_url:'', 
    image_urls: [],
    is_barter:false,
    allow_barter: false,
    desired_item:'',
    location: '',
    contact_phone: ''
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { t } = useI18n()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const onChange = (k: string, v: any) => setForm(prev => ({...prev, [k]: v}))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return
    
    // Validate all files
    const validFiles: File[] = []
    const newPreviews: string[] = []
    
    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMsg(t('post.imageInvalid', 'Please upload an image file'))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMsg(t('post.imageTooLarge', 'Image size must be less than 5MB'))
        return
      }
      
      validFiles.push(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        
        // Update state when all files are read
        if (newPreviews.length === validFiles.length) {
          const allPreviews = [...imagePreviews, ...newPreviews]
          const allFiles = [...selectedFiles, ...validFiles]
          
          setImagePreviews(allPreviews)
          setSelectedFiles(allFiles)
          
          // Update form with array of image URLs
          onChange('image_urls', allPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
    
    // Reset file input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    
    setImagePreviews(newPreviews)
    setSelectedFiles(newFiles)
    onChange('image_urls', newPreviews)
  }

  const submit = async () => {
    // Validation
    if (!form.contact_phone) {
      setMsg(t('post.contactRequired', '联系方式为必填项'))
      return
    }
    
    setLoading(true)
    try {
      const r = await fetch(`${API}/items/`, { 
        method:'POST', 
        headers: authHeaders(), 
        body: JSON.stringify({
          ...form,
          price: form.price ? parseFloat(String(form.price)) : null,
          image_urls: imagePreviews.length > 0 ? imagePreviews : (form.image_url ? [form.image_url] : []),
          // Keep first image in image_url for backward compatibility
          image_url: imagePreviews.length > 0 ? imagePreviews[0] : form.image_url
        })
      })
      const data = await r.json()
      setLoading(false)
      if (r.ok) {
        setMsg(t('post.success', '发布成功！商品已上架'))
        setForm({ title:'', description:'', price:'', category:'', condition:'', image_url:'', image_urls: [], is_barter:false, allow_barter: false, desired_item:'', location: '', contact_phone: '' })
        setSelectedFiles([])
        setImagePreviews([])
        setStep(1)
      } else {
        setMsg(data?.detail || t('post.fail', '发布失败，请重试'))
      }
    } catch (error) {
      setLoading(false)
      setMsg(t('post.networkError', '网络错误，请检查连接'))
    }
  }

  const nextStep = () => {
    if (step === 1 && form.title && form.category) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= stepNum 
                  ? 'bg-brand-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`h-1 w-16 mx-2 ${
                  step > stepNum ? 'bg-brand-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{t('post.steps.basic', '基本信息')}</span>
          <span>{t('post.steps.detail', '详细信息')}</span>
          <span>{t('post.steps.confirm', '发布确认')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主表单 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('post.title', '发布商品')}</h1>
              <p className="text-gray-600 mb-6">{t('post.subtitle', '分享你的闲置物品，让它们重新发光发热')}</p>

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('post.form.title', '商品标题')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                      placeholder={t('post.form.titlePlaceholder', '例如：iPhone 13 Pro 128GB 深空灰')}
                      value={form.title}
                      onChange={e => onChange('title', e.target.value)} 
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('post.form.titleTip', '简洁明了的标题能吸引更多买家')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('post.form.category', '商品分类')} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => onChange('category', cat.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                            form.category === cat.value
                              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-pressed={form.category === cat.value}
                          role="button"
                        >
                          <span className="text-lg">{cat.icon}</span>
                          {t(cat.key, cat.value)}
                          {form.category === cat.value && (
                            <span className="ml-auto text-xs text-brand-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('post.form.condition', '商品成色')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {conditions.map((cond) => (
                        <button
                          key={cond.value}
                          type="button"
                          onClick={() => onChange('condition', cond.value)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            form.condition === cond.value
                              ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-pressed={form.condition === cond.value}
                          role="button"
                        >
                          {t(cond.key, cond.value)}
                          {form.condition === cond.value && (
                            <span className="ml-2 text-xs text-brand-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('post.form.description', '商品描述')}</label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                      placeholder={t('post.form.descriptionPlaceholder', '详细描述商品的使用情况、配件、购买时间等信息...')}
                      value={form.description}
                      onChange={e => onChange('description', e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('post.form.price', '售价 (元)')}</label>
                      <input 
                        type="number"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                        placeholder="例如：3500"
                        value={form.price}
                        onChange={e => onChange('price', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('post.form.location', '所在位置')}</label>
                      <input 
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                        placeholder={t('post.form.locationPlaceholder', '例如：AIT 校园内')}
                        value={form.location}
                        onChange={e => onChange('location', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('post.form.contact', '联系方式')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                      placeholder={t('post.form.contactPlaceholder', '手机号码或微信号')}
                      value={form.contact_phone}
                      onChange={e => onChange('contact_phone', e.target.value)} 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('post.form.image', '商品图片')}
                    </label>
                    
                    {imagePreviews.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white hover:file:bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t('post.form.imageTip', '支持 jpg, png 格式，建议尺寸 800x600，最大 5MB，可上传多张图片')}
                      </p>
                      {imagePreviews.length > 0 && (
                        <p className="mt-1 text-xs text-blue-600">
                          {t('post.form.imageCount', `已上传 ${imagePreviews.length} 张图片`).replace('{count}', String(imagePreviews.length))}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" 
                        checked={form.is_barter}
                        onChange={e => {
                          onChange('is_barter', e.target.checked)
                          // If is_barter is checked, uncheck allow_barter
                          if (e.target.checked) {
                            onChange('allow_barter', false)
                          }
                        }} 
                      />
                      <label className="text-sm font-medium text-gray-700">{t('post.form.isBarter', 'Barter only (no price)')}</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" 
                        checked={form.allow_barter}
                        onChange={e => {
                          onChange('allow_barter', e.target.checked)
                          // If allow_barter is checked, uncheck is_barter
                          if (e.target.checked) {
                            onChange('is_barter', false)
                          }
                        }} 
                      />
                      <label className="text-sm font-medium text-gray-700">{t('post.form.allowBarter', 'Accepts barter (has price but can also be exchanged)')}</label>
                    </div>
                    {(form.is_barter || form.allow_barter) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('post.form.desiredItem', 'Desired item')}</label>
                        <input 
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                          placeholder={t('post.form.desiredItemPlaceholder', 'e.g. MacBook Air or cash')}
                          value={form.desired_item}
                          onChange={e => onChange('desired_item', e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('post.confirm.title', '确认发布信息')}</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {imagePreviews.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {imagePreviews.map((preview, index) => (
                            <img key={index} src={preview} alt={form.title} className="h-20 w-20 rounded-lg object-cover border border-gray-300" />
                          ))}
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{form.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{t('post.confirm.category', '分类：')}{categories.find(c => c.value === form.category)?.label}</span>
                          <span>{t('post.confirm.condition', '成色：')}{conditions.find(c => c.value === form.condition)?.label}</span>
                          {form.price && <span>{t('post.confirm.price', '价格：')}¥{form.price}</span>}
                        </div>
                        {form.contact_phone && (
                          <div className="mt-2 text-sm text-gray-600">
                            {t('post.confirm.contact', '联系方式')}: {form.contact_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>{t('post.confirm.note1', '发布后，你的商品将出现在首页和分类页面中，其他用户可以浏览和联系你。')}</p>
                    <p className="mt-2">{t('post.confirm.note2', '如有问题，可以随时在个人中心编辑或下架商品。')}</p>
                  </div>
                </div>
              )}

              {/* 按钮组 */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button 
                  onClick={prevStep}
                  disabled={step === 1}
                  className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('post.cta.prev', '上一步')}
                </button>
                
                <div className="flex gap-3">
                  {step < 3 ? (
                    <button 
                      onClick={nextStep}
                      disabled={
                        (step === 1 && (!form.title || !form.category)) ||
                        (step === 2 && !form.contact_phone)
                      }
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('post.cta.next', '下一步')}
                    </button>
                  ) : (
                    <button 
                      onClick={submit} 
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? t('post.cta.submitting', '发布中...') : t('post.cta.confirm', '确认发布')}
                    </button>
                  )}
                </div>
              </div>

              {msg && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  msg.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {msg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 侧边栏提示 */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-gray-900 mb-4">{t('post.tips.title', '发布小贴士')}</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('post.tips.photoTitle', '📸 优质图片')}</h4>
                  <p>{t('post.tips.photoDesc', '清晰的照片能提高商品吸引力，建议多角度拍摄')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('post.tips.descTitle', '📝 详细描述')}</h4>
                  <p>{t('post.tips.descDesc', '如实描述商品状态，包括购买时间、使用情况等')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('post.tips.priceTitle', '💰 合理定价')}</h4>
                  <p>{t('post.tips.priceDesc', '参考同类商品价格，设置合理的售价')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('post.tips.safeTitle', '🔒 安全交易')}</h4>
                  <p>{t('post.tips.safeDesc', '建议在校园内当面交易，确保双方安全')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
