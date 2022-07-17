import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import {CONTRACT_ABI, CONTRACT_ADDRESS} from './config';
import request from './request';
import {BASE_URL} from './config';

function App() {
    const [account, setAccount] = useState(null); // 设置账号的状态变量
    const [contract, setContract] = useState(null);
    const [web3Instance, setWeb3Instance] = useState(null);
    const [articleCount, setArticleCount] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [eventList, setEventList] = useState([]);
    const APiListUrl = 'api/event/list';

    useEffect(() => {
        getWeb3Instance().then(res => setWeb3Instance(res))
        fetchEventList().then();
        setLoading(false)
    }, []);

    useEffect(() => {
        if (web3Instance) {
            getContract().then(res => {
                setContract(res)
            })
            getAccount().then(res => setAccount(res))
        }
    }, [web3Instance]);

    useEffect(() => {
        if (contract) {
            contract.events.ArticleCreated({
                filter: {},
                fromBlock: 'latest'
            }, function (error, event) {
            })
                .on('data', function (event) {
                    saveEventData(event).then(r => {
                        fetchEventList().then(r => {
                        })
                    })
                })
                .on('error', console.error);

            getArticleCount().then(res => setArticleCount(res))
        }
    }, [contract]);

    /**
     * 保存event数据到数据库
     * @param event
     * @returns {Promise<void>}
     */
    const saveEventData = async (event) => {
        let data = {
            'address': event.address,
            'blockHash': event.blockHash,
            'blockNumber': event.blockNumber,
            'event': event.event,
            'event_id': event.id,
            'log_index': event.logIndex,
            'raw': event.raw,
            'removed': event.removed,
            'returnValues': event.returnValues,
            'signature': event.signature,
            'transactionHash': event.transactionHash,
            'transactionIndex': event.transactionIndex,
        }
        await request.post('api/event/create', data)
    }

    /**
     * 获取数据库event列表
     * @returns {Promise<void>}
     */
    const fetchEventList = async () => {
        let data = {
            'page_num': 1,
            'page_size': 100,
        }
        await request.post(APiListUrl, data).then(res => {
            let {code, data, msg} = res;
            if (code === 200) {
                setEventList(data.slice());
            } else {
                console.log('fetchEventList error', msg)
            }
        })
    }

    /**
     * 获取web3实例
     * @returns {Promise<Web3>}
     */
    const getWeb3Instance = async () => {
        return new Web3(Web3.givenProvider)
    }

    /**
     * 获取合约
     * @returns {Promise<Contract>}
     */
    const getContract = async () => {
        return new web3Instance.eth.Contract(
            CONTRACT_ABI,
            CONTRACT_ADDRESS
        );
    }

    /**
     * 获取账户
     * @returns {Promise<string>}
     */
    const getAccount = async () => {
        try {
            // await Web3.givenProvider.enable()
            const accounts = await web3Instance.eth.requestAccounts()
            return accounts[0];
        } catch (error) {
            console.log('getAccount error', error)
        }
    }

    /**
     * 获取文章数
     * @returns {Promise<*>}
     */
    const getArticleCount = async () => {
        return await contract.methods.articleCount().call()
    }

    /**
     * 提交
     * @returns {Promise<void>}
     */
    const submit = async () => {
        if (contract) {
            setLoading(true)
            await contract.methods.createArticle(title, content)
                .send({from: account})
                .then((res) => {
                    setLoading(false)
                })
        }
    }

    const inputTitleChange = (e) => {
        setTitle(e.target.value)
    }

    const inputContentChange = (e) => {
        setContent(e.target.value)
    }

    return (
        <div>
            <h2>写入数据</h2>
            <hr/>
            <div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                标题：<input type="text" onChange={(e) => inputTitleChange(e)}/>
                &nbsp;&nbsp;&nbsp;&nbsp;
                内容：<input type="text" onChange={(e) => inputContentChange(e)}/>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <button onClick={submit.bind(this)}>提交</button>
            </div>

            <div className={`${loading ? '' : 'hide'} loading-wrap`}>
                <div className="loading">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>

            <h2>事件数据</h2>
            <h3>请求API：{BASE_URL + APiListUrl}?page_num=1&page_size=100</h3>
            <table>
                <thead>
                <tr>
                    <th>id</th>
                    <th className="th1">address</th>
                    <th className="th1">blockHash</th>
                    <th className="th1">blockNumber</th>
                    <th className="th1">event</th>
                    <th className="th1">event_id</th>
                    <th>logIndex</th>
                    <th className="th1">raw</th>
                    <th>removed</th>
                    <th className="th1">returnValues</th>
                    <th className="th1">signature</th>
                    <th className="th1">transactionHash</th>
                    <th>transactionIndex</th>
                    <th className="td1">createdAt</th>
                </tr>
                </thead>

                <tbody>
                {
                    eventList.map((value, index) => {
                        return (
                            <tr key={index}>
                                <td>{value.id}</td>
                                <td className="td1">{value.address}</td>
                                <td className="td1">{value.blockHash}</td>
                                <td className="td1">{value.blockNumber}</td>
                                <td className="td1">{value.event}</td>
                                <td className="td1">{value.eventId}</td>
                                <td>{value.logIndex}</td>
                                <td className="td1"><span title={value.raw}>raw</span></td>
                                <td>{value.removed}</td>
                                <td className="td1"><span title={value.returnValues}>returnValues</span></td>
                                <td className="td1">{value.signature}</td>
                                <td className="td1">{value.transactionHash}</td>
                                <td>{value.transactionIndex}</td>
                                <td className="td1">{value.createdAt}</td>
                            </tr>
                        );
                    })
                }
                </tbody>

            </table>
        </div>
    );
}

export default App;
