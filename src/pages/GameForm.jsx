export default function GameForm() {
    function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const game_title = formData.get("game_title")
        const game_thumbnailURL = formData.get("game_thumbnailURL")
        const game_description = formData.get("game_description")
        const game_theme = formData.get("game_theme")
        const game_tag = formData.get("game_tag")
        const game_difficulty = formData.get("game_difficulty")
        const game_playTime = formData.get("game_playTime")
        const game_visibility = formData.get("game_visibility")
        const game_isRanking = formData.get("game_isRanking")
        const game_isHiddenStage = formData.get("game_isHiddenStage")
        const data = [
            game_title,
            game_thumbnailURL,
            game_description,
            game_theme,
            game_tag,
            game_difficulty,
            game_playTime,
            game_visibility,
            game_isRanking,
            game_isHiddenStage
        ]
        console.log(data)
    }
}