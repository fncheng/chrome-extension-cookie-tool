import { produce } from 'immer'
import { useEffect, useState } from 'react'

type DataItem = {
    sourceUrl: string
    targetUrl: string
    cookieKey: string
}

const INIT_ITEM: DataItem = {
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
    const handleAddItem = () => {
        setItems(
            produce((draft) => {
                draft.push(INIT_ITEM)
            })
        )
    }

    const handleDeleteItem = (index: number) => {
        setItems(
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
        // 发送消息给 background script
        try {
            chrome.runtime.sendMessage(
                {
                    action: 'transferCookie',
                    info: items[index]
                    // sourceUrl,
                    // targetUrl,
                    // cookieKey
                },
                (response: any) => {
                    // 更新状态显示传输结果
                    setTransferStatus(
                        produce((draft) => {
                            draft[index] =
                                response?.message ||
                                (response?.success
                                    ? MESSAGE_TRANSFER_SUCCESS
                                    : MESSAGE_TRANSFER_FAILED)
                        })
                    )
                }
            )
        } catch (error) {
            console.log('error: ', error)
        }
    }

    useEffect(() => {
        localStorage.setItem('items', JSON.stringify(items))
    }, [items])

    return (
        <div className='container'>
            {items.map((item, index) => {
                return (
                    <div
                        key={index}
                        className='brutalist-card'
                        style={index >= 1 ? { borderTop: 'none' } : {}}
                    >
                        <div className='input-container'>
                            <input
                                type='text'
                                className='input'
                                name='text'
                                id='sourceUrl'
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
                            <label className='label' htmlFor='input'>
                                源网址:
                            </label>
                            <div className='topline'></div>
                            <div className='underline'></div>
                        </div>

                        <div className='input-container'>
                            <input
                                type='text'
                                className='input'
                                name='text'
                                id='targetUrl'
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
                            <label htmlFor='input' className='label'>
                                目标网址:
                            </label>
                            <div className='topline'></div>
                            <div className='underline'></div>
                        </div>

                        <div className='input-container'>
                            <input
                                type='text'
                                className='input'
                                name='text'
                                id='cookieKey'
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
                            <label htmlFor='input' className='label'>
                                Cookie Key:
                            </label>
                            <div className='topline'></div>
                            <div className='underline'></div>
                        </div>

                        <div className='btn'>
                            <button
                                className='button type1'
                                id='transfer'
                                onClick={() => handleTransfer(index)}
                            >
                                <span className='btn-txt'>传输 Cookie</span>
                            </button>
                        </div>
                        <br />

                        <span id='transferStatus'>{transferStatus[index]}</span>
                        {index !== 0 && (
                            <button
                                className='btn-icon--delete'
                                onClick={() => handleDeleteItem(index)}
                            >
                                x
                            </button>
                        )}

                        {index === items.length - 1 && (
                            <button className='btn-icon--plus' onClick={handleAddItem}>
                                +
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default App
