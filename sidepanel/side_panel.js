document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['researchNotes'], function (result) {
        if (result.researchNotes) {
            document.getElementById('notes').value = result.researchNotes;
        }

    })
})

document.getElementById('summarizeBtn').addEventListener('click', summarizeText);

document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);

async function summarizeText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        await chrome.permissions.request({
            origins: [new URL(tab.url).origin + "/*"]
        });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });

        const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_SELECTION" });
        const result = response?.text;

        if (!result || result.trim() === "") {
            showResults("Please select some text first");
            return;
        }

        // const apiResponse = await fetch("http://localhost:8080/api/research/process", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ content: result, operation: "summarize" })
        // });


        const apiResponse = await fetch("https://research-assistant-backend-6l7n.onrender.com/api/research/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: result, operation: "summarize" })
        });

        if (!apiResponse.ok) {
            throw new Error(`API Error: ${apiResponse.status}`);
        }

        const text = await apiResponse.text();
        showResults(text);

    } catch (error) {
        showResults("Error: " + error.message);
    }
}





// async function summarizeText() {
//     try{
//         const [tab] = await chrome.tabs.query({active:true, currentWindow:true})

//         const[{result}] = await chrome.scripting.executeScript({
//             target:{tabId: tab.id},
//             function: ()=> window.getSelection().toString()
//         })

//         if(!result)
//         {
//             showResults("Please select some text first");
//             return; 
//         }

//         const response = await fetch('http://localhost:8080/api/research/process', {
//             method: 'POST',
//             headers: {"Content-Type":'application/json'}, 
//             body: JSON.stringify({content: result, operation: 'summarize'})
//          } );

//          if(!response.ok)
//          {
//             throw new Error(`API Error: ${response.status}`);
//          }

//          const text = await response.text();
//          showResults(text.replace(/\n/g,'<br>'));
//     }

//     catch(error)
//     {
//         showResults("Error: "+error.message)
//     }

// }


async function saveNotes() {

    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ 'researchNotes': notes }, function () {
        alert('Notes saved Successfully');
    });


}

function showResults(content) {

    // document.getElementById('results').innerText = content;

    document.getElementById('results').innerHTML = `<div class = "result-item">
        <div class="result-content">${content}</div>
    </div>`;

}