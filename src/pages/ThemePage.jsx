import { useParams } from "react-router-dom"

// const theme = this.props.match.params.theme
export default function ThemePage() {
    const params = useParams();
    const theme = params.theme;
    
    return(
        <>
        <h1>테마 페이지 입니다.</h1>
        <h2>[현재 테마: {theme}]</h2>
        </>
    )
}