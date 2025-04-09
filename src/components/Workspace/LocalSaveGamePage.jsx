export default function LocalSaveGamePage(props) {
    const game = props.game;
    function downloadGame() {
        const data = { game }
        // console.log("0", data)
        const datastr = JSON.stringify(data, null, 2);
        // console.log("1", datastr)
        const datablob = new Blob([datastr], {type: "application/json"});
        // console.log("2", datablob)
        const dataurl = URL.createObjectURL(datablob);
        // console.log("3", dataurl)
        return dataurl;
    }

    return(
        <a href={downloadGame()} download="sherlock-game.json">게임데이터 다운로드</a>
    )
}