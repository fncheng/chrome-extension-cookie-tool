import { produce } from 'immer'
import { useEffect, useState } from 'react'

// 定义类型
interface ChromeMessage {
    action: string
    info: DataItem
}

interface ChromeResponse {
    success: boolean
    message?: string
}

// 声明 chrome 类型，修复 linter 错误
declare const chrome: {
    runtime: {
        sendMessage: (
            message: ChromeMessage,
            callback: (response: ChromeResponse) => void
        ) => void
    }
}

type DataItem = {
    title: string
    sourceUrl: string
    targetUrl: string
    cookieKey: string
}

const INIT_ITEM: DataItem = {
    title: '',
    sourceUrl: '',
    targetUrl: '',
    cookieKey: ''
}
const MESSAGE_TRANSFER_SUCCESS = 'Cookie 传输成功！'
const MESSAGE_TRANSFER_FAILED = 'Cookie 传输失败！'
const MESSAGE_TRANSFER_EMPTY = '请填写完整的信息！'

const getLocalItems = (): DataItem[] => {
    try {
        const storedItems = localStorage.getItem('items')
        return storedItems ? JSON.parse(storedItems) : []
    } catch (e) {
        console.error('Failed to parse items from localStorage', e)
        return []
    }
}

function App() {
    const [items, setItems] = useState<DataItem[]>(() => {
        const localItems: DataItem[] = getLocalItems()
        return localItems.length > 0 ? localItems : [INIT_ITEM]
    })
    const [transferStatus, setTransferStatus] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean[]>([])

    const handleAddItem = () => {
        setItems(
            produce((draft) => {
                draft.push(INIT_ITEM)
            })
        )
        setIsLoading(prev => [...prev, false])
    }

    const handleDeleteItem = (index: number) => {
        setItems(
            produce((draft) => {
                draft.splice(index, 1)
            })
        )
        setTransferStatus(
            produce((draft) => {
                draft.splice(index, 1)
            })
        )
        setIsLoading(
            produce((draft) => {
                draft.splice(index, 1)
            })
        )
    }

    const handleTransfer = (index: number) => {
        if (
            items[index].sourceUrl === '' ||
            items[index].targetUrl === '' ||
            items[index].cookieKey === ''
        ) {
            setTransferStatus(
                produce((draft) => {
                    draft[index] = MESSAGE_TRANSFER_EMPTY
                })
            )
            return
        }
        
        setIsLoading(
            produce((draft) => {
                draft[index] = true
            })
        )
        
        try {
            chrome.runtime.sendMessage(
                {
                    action: 'transferCookie',
                    info: items[index]
                },
                (response: ChromeResponse) => {
                    setTransferStatus(
                        produce((draft) => {
                            draft[index] =
                                response?.message ||
                                (response?.success
                                    ? MESSAGE_TRANSFER_SUCCESS
                                    : MESSAGE_TRANSFER_FAILED)
                        })
                    )
                    
                    setIsLoading(
                        produce((draft) => {
                            draft[index] = false
                        })
                    )
                }
            )
        } catch (error) {
            console.log('error: ', error)
            setIsLoading(
                produce((draft) => {
                    draft[index] = false
                })
            )
        }
    }

    useEffect(() => {
        localStorage.setItem('items', JSON.stringify(items))
    }, [items])
    
    useEffect(() => {
        setIsLoading(new Array(items.length).fill(false))
    }, [])

    return (
        <div className='app-container'>
            <div className='container'>
                {items.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className='brutalist-card'
                            style={index >= 1 ? { marginTop: '15px' } : {}}
                        >
                            <div className='input-container'>
                                <input
                                    type='text'
                                    className='input'
                                    id={`title-${index}`}
                                    placeholder='为此配置添加标题（可选）'
                                    value={item.title}
                                    onChange={(e) =>
                                        setItems(
                                            produce((draft) => {
                                                draft[index].title = e.target.value
                                            })
                                        )
                                    }
                                />
                                <label className='label' htmlFor={`title-${index}`}>
                                    配置标题:
                                </label>
                                <div className='topline'></div>
                                <div className='underline'></div>
                            </div>

                            <div className='input-container'>
                                <input
                                    type='text'
                                    className='input'
                                    id={`sourceUrl-${index}`}
                                    placeholder='例如: https://example.com'
                                    value={item.sourceUrl}
                                    onChange={(e) =>
                                        setItems(
                                            produce((draft) => {
                                                draft[index].sourceUrl = e.target.value
                                            })
                                        )
                                    }
                                />
                                <label className='label' htmlFor={`sourceUrl-${index}`}>
                                    源网址:
                                </label>
                                <div className='topline'></div>
                                <div className='underline'></div>
                            </div>

                            <div className='input-container'>
                                <input
                                    type='text'
                                    className='input'
                                    id={`targetUrl-${index}`}
                                    placeholder='例如: https://target.com'
                                    value={item.targetUrl}
                                    onChange={(e) =>
                                        setItems(
                                            produce((draft) => {
                                                draft[index].targetUrl = e.target.value
                                            })
                                        )
                                    }
                                />
                                <label className='label' htmlFor={`targetUrl-${index}`}>
                                    目标网址:
                                </label>
                                <div className='topline'></div>
                                <div className='underline'></div>
                            </div>

                            <div className='input-container'>
                                <input
                                    type='text'
                                    className='input'
                                    id={`cookieKey-${index}`}
                                    placeholder='Cookie 名称，多个用英文逗号分隔'
                                    value={item.cookieKey}
                                    onChange={(e) =>
                                        setItems(
                                            produce((draft) => {
                                                draft[index].cookieKey = e.target.value
                                            })
                                        )
                                    }
                                />
                                <label className='label' htmlFor={`cookieKey-${index}`}>
                                    Cookie Key:
                                </label>
                                <div className='topline'></div>
                                <div className='underline'></div>
                            </div>

                            <div className='btn'>
                                <button
                                    className={`button type1 ${isLoading && isLoading[index] ? 'loading' : ''}`}
                                    id='transfer'
                                    onClick={() => handleTransfer(index)}
                                    disabled={isLoading && isLoading[index]}
                                >
                                    <span className='btn-txt'>
                                        {isLoading && isLoading[index] ? '传输中...' : '传输 Cookie'}
                                    </span>
                                </button>
                            </div>
                            
                            {transferStatus[index] && (
                                <div className={`transfer-status ${transferStatus[index] === MESSAGE_TRANSFER_EMPTY || transferStatus[index] === MESSAGE_TRANSFER_FAILED ? 'error' : 'success'}`}>
                                    {transferStatus[index]}
                                </div>
                            )}

                            {index !== 0 && (
                                <button
                                    className='btn-icon--delete'
                                    onClick={() => handleDeleteItem(index)}
                                    title="删除此配置"
                                >
                                    x
                                </button>
                            )}

                            {index === items.length - 1 && (
                                <button 
                                    className='btn-icon--plus' 
                                    onClick={handleAddItem}
                                    title="添加新配置"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
            
            <footer className="app-footer">
                <p>Cookie 传输工具 v1.0</p>
            </footer>
        </div>
    )
}

export default App
