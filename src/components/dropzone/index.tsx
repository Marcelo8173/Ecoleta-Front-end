import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './style.css'

interface Props{
    onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({onFileUpload}) => {
    const [selectedFile, setSelectedFile] = useState('');

  const onDrop = useCallback(acceptedFiles => {
      const file = acceptedFiles[0];
      const fileURL = URL.createObjectURL(file);
        
      setSelectedFile(fileURL);
      onFileUpload(file);
      
    }, [onFileUpload])
  
    const {getRootProps, getInputProps} = useDropzone({onDrop,accept:"image/*"})

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*"/>
      {
          selectedFile ? <img src={selectedFile} alt="Point"/> :
          <p>
          <FiUpload/>
          Imagem do estabelicimento
        </p>
      }
    </div>
  )
}

export default Dropzone;