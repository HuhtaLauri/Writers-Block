import "../css/DocFile.css"



function DocFile({file}) {
    
    return <div className="docfile" key={file.id}>
        <img className="icon" src={file.iconLink} alt="" />
        <a className="file-link" href={`/file/${file.id}`} target="_blank" rel="noopener noreferrer">
        <p className="file-name">{file.name}</p>
        </a>
    </div>
}

export default DocFile
