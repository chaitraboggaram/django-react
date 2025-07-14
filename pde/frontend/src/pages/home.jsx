import { useState, useEffect } from "react";
import api from "../api";
import Document from "../components/document";
import "../styles/home.css";

function Home() {
    const [documents, setDocuments] = useState([]);

    const [agilePn, setAgilePn] = useState("");
    const [agileRev, setAgileRev] = useState("");
    const [docTitle, setDocTitle] = useState("");
    const [docType, setDocType] = useState("");
    const [docId, setDocId] = useState("");

    useEffect(() => {
        getDocuments();
    }, []);

    const getDocuments = () => {
        api
            .get("/documents/")
            .then((res) => res.data)
            .then((data) => {
                setDocuments(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const deleteDocument = (id) => {
        api
            .delete(`/documents/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Document deleted!");
                else alert("Failed to delete document.");
                getDocuments();
            })
            .catch((error) => alert(error));
    };

    const createDocument = (e) => {
        e.preventDefault();
        api
            .post("/documents/", {
                agile_pn: agilePn,
                agile_rev: agileRev,
                doc_title: docTitle,
                doc_type: docType,
                doc_id: docId,
            })
            .then((res) => {
                if (res.status === 201) {
                    alert("Document created!");
                    getDocuments();
                    // Clear input fields after successful submission
                    setAgilePn("");
                    setAgileRev("");
                    setDocTitle("");
                    setDocType("");
                    setDocId("");
                } else {
                    alert("Failed to make document.");
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <div>
                <h2>Documents</h2>
                {documents.map((document) => (
                    <Document document={document} onDelete={deleteDocument} key={document.id} />
                ))}
            </div>
            <h2>Create a Document</h2>
            <form onSubmit={createDocument}>
                <label htmlFor="agile_pn">Agile PN:</label>
                <input
                    type="text"
                    id="agile_pn"
                    required
                    value={agilePn}
                    onChange={(e) => setAgilePn(e.target.value)}
                />
                <br />

                <label htmlFor="agile_rev">Agile Rev:</label>
                <input
                    type="text"
                    id="agile_rev"
                    required
                    value={agileRev}
                    onChange={(e) => setAgileRev(e.target.value)}
                />
                <br />

                <label htmlFor="doc_title">Doc Title:</label>
                <input
                    type="text"
                    id="doc_title"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                />
                <br />

                <label htmlFor="doc_type">Doc Type:</label>
                <input
                    type="text"
                    id="doc_type"
                    required
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                />
                <br />

                <label htmlFor="doc_id">Doc ID:</label>
                <input
                    type="text"
                    id="doc_id"
                    required
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                />
                <br />

                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default Home;
