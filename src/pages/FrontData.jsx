export default function FrontData({game}) {
    console.log(game)
    return(
        <div>
            <h1>{game.title}</h1>
            <table>
                <tbody>
                    <tr>
                        <td>썸네일 경로: </td>
                        <td>{game.thumbnailURL}</td>
                    </tr>
                    <tr>
                        <td>설명: </td>
                        <td>{game.description}</td>
                    </tr>
                    <tr>
                        <td>테마: </td>
                        <td>{game.theme}</td>
                    </tr>
                    <tr>
                        <td>태그: </td>
                        <td>{game.tag}</td>
                    </tr>
                    <tr>
                        <td>소요시간: </td>
                        <td>{game.playTime}</td>
                    </tr>
                    <tr>
                        <td>공개: </td>
                        <td>{game.visibility}</td>
                    </tr>
                    <tr>
                        <td>랭킹?: </td>
                        <td>{game.isRanking ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>히든?: </td>
                        <td>{game.isHiddenStage ? '있음' : '없음'}</td>
                    </tr>
                    <tr>
                        <td>인벤토리: </td>
                        <td>{game.inventory ? '있음': '없음'}</td>
                    </tr>
                </tbody>
            </table>
            <div style={{marginLeft: "50px", backgroundColor: 'aliceblue'}}>{game.stage.map((data)=>(
                <>
                <h2>스테이지</h2>
                <table id="stage">
                    <tbody>
                    <tr>
                        <td>스테이지 이름</td>
                        <td>{data.name}</td>
                    </tr>
                    <tr>
                        <td>타입</td>
                        <td>{data.type}</td>
                    </tr>
                    <tr>
                        <td>사진 경로</td>
                        <td>{data.imgURL}</td>
                    </tr>
                    <tr>
                        <td>설명</td>
                        <td>{data.description}</td>
                    </tr>
                    <tr>
                        <td>시간제한</td>
                        <td>{data.timeLimit}</td>
                    </tr>
                    <tr>
                        <td>출입여부</td>
                        <td>{data.gateOpen}</td>
                    </tr>
                    <tr>
                        <td>닫힘메세지</td>
                        <td>{data.closedGateMessage}</td>
                    </tr>
                    </tbody>
                    </table>
                        <div className="cut"><h3>컷</h3>
                        {data.cut.map((data)=>(
                            <table>
                                <tbody>
                                <tr>
                                    <td>컷 이름</td>
                                    <td>{data.name}</td>
                                </tr>
                                <tr>
                                    <td>타입</td>
                                    <td>{data.type}</td>
                                </tr>
                                <tr>
                                    <td>사진경로</td>
                                    <td>{data.imgURL}</td>
                                </tr>
                                <tr>
                                    <td>시간제한</td>
                                    <td>{data.timeLimit}</td>
                                </tr>
                                </tbody>
                            </table>
                        ))}
                        </div>
                </>
            ))}
            </div>
        </div>
    )
}