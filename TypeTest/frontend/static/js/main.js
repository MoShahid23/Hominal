//object that handles newlines
var newline = new NewLine();

//tagElement refers to the span that contains the prompt tag.
var tagElement = document.getElementById("tag")
var tagElementName = document.getElementById("tag-name")
var tag = tagElement.innerHTML

//main element container for terminal
let mainContainer = document.getElementById("main");

//refers to the div that holds both the tag and input spans.
var inputElement = document.getElementById("terminalInput")

var current_command;
var commands = [];

//refers to the input span.
let input = document.getElementById("input");
const commandList = ["help", "clear", "tag", "run"]

//focuses on input on load.
input.focus();

//all sub programs
var typetest = new TypeTest(inputElement);
var snake = new Snake(inputElement);
var pong = new Pong(inputElement);

//focuses the users caret onto the current input span (on document click).
document.addEventListener('click', function(){input.focus()})
input.addEventListener("keydown", function(event){
    if(event.code === 'Tab'){
        event.preventDefault()
    }
    else if(event.code === "ArrowUp"){
        event.preventDefault();
    }
    else if(event.code === "ArrowDown"){
        event.preventDefault();
    }
})
//handles the submission of the input
input.addEventListener('keyup', function(event) {
    event.preventDefault()
    let inputValue = convertToPlain(input.innerHTML);
    if(event.code === 'Tab' && inputValue.length > 0){
        let subCommandList = commandList.filter(str => str.startsWith(inputValue))
        console.log(subCommandList)
        switch (true){
            case subCommandList[0] == "clear":
                input.innerText = "clear"
                setCarat(input)
                break;
            case subCommandList[0] == "help":
                input.innerText = "help"
                setCarat(input)
                break;
            case subCommandList[0] == "run":
                input.innerText = "run"
                setCarat(input)
                break;
            case subCommandList[0] == "tag":
                input.innerText = "tag"
                setCarat(input)
                break;
        }
    }
    if (event.code === 'Enter'){
        //formatting the users input, i.e. sanitising input.
        inputValue = inputValue.replace("/", "")
        console.log("isolated input: " + inputValue)

        //handing off input to the input handler
        inputResponse(inputValue)
        newline.create(tag + input.innerHTML, 0, true);
        input.innerHTML = "";

        //this if statement helps filter out empty entries from the list of previous entries
        if(inputValue.replace(" ", "")!=""){
            commands.push(inputValue)
        }
        current_command = commands.length;
    }
    else if (event.code === "ArrowUp" && current_command != 0){
        event.preventDefault();
        current_command -= 1
        setCommandValue();
    }
    else if (event.code === "ArrowDown" && current_command != commands.length){
        event.preventDefault();
        current_command += 1
        setCommandValue();
    }
});

function setCommandValue(){
    if (commands[current_command] === undefined){
        input.innerHTML = ""
    }
    else {
        input.innerHTML = commands[current_command]
    }
    setCarat(input)
}

function inputResponse(inputVal) {
    fetch(`/commands/${inputVal}`)
    .then(response => response.text())
    .then(text => {
        console.log(text);
        switch(true){
            case text.includes("0x0000"): //empty newline on enter
                text = "";
                break;
            case text.includes("0x0001"): //clear
                while(document.getElementsByClassName("line").length > 0){
                    document.getElementsByClassName("line")[0].remove()
                }
                break;

            case text.includes("0x0002"): //tag -n
                text = text.replace("0x0002", "")
                tagElementName.innerHTML = text+"@type-test"
                tag = tagElement.innerHTML;
                text = "name successfully changed to: " + text;
                newline.create(text);
                break;

            case text.includes("0x0003"): //tag -c
                text = text.replace("0x0003", "");
                if(text == "default"){
                    tagElementName.style.color = 'rgb(138,223,50)'
                    tag = tagElement.innerHTML;
                }
                else if(text.includes("hex(")){
                    text = text.replace("hex(", "").replace(")", "")
                    tagElementName.style.color = `#${text}`

                }
                else if(text.includes("rgb(")){
                    text = text.replace("rgb(", "").replace(")", "")
                    tagElementName.style.color = `rgb(${text})`
                }
                else{
                    tagElementName.style.color = text
                }
                tag = tagElement.innerHTML;

                text = "color changed successfully! if this is untrue, please see help tag.";
                newline.create(text);
                break;

            case text.includes("0x0004"): //typetest
                setTimeout(() => {
                    typetest.run(text.replace("0x0004", ""))
                }, 250);
                window.scrollTo(0, 0)
                break;

            case text.includes("0x0005"): //snake
                setTimeout(() => {
                    snake.run()
                }, 250);
                window.scrollTo(0, 0)
                break;

            case text.includes("0x0006"): //pong
                setTimeout(() => {
                    pong.run()
                }, 250);
                window.scrollTo(0, 0)
                break;

            default: //no match, response is formatted from backend
                console.log("running")
                newline.create(text, 0, true);
                break;
        }
        if(document.getElementById("main") != null){
            console.log(document.getElementById("main"));
            window.scrollTo(0, document.body.scrollHeight)
        }
    });
}

//this cosntructor should build spans that make up the terminal history
function NewLine(){
    this.newline;
    let that = this;
    this.create = function(text, time = 0, animate = false){
        setTimeout(function() {
            this.text = text;
            that.newline = document.createElement("span")
            that.newline.className = "line"
            that.newline.innerHTML = this.text;
            if(animate){
                that.newline.classList.add("typedBlock")
            }
            mainContainer.appendChild(that.newline)
            setTimeout(() => {
                while(document.getElementsByClassName("typedBlock")[0] != null){
                        document.getElementsByClassName("typedBlock")[0].classList.remove("typedBlock")
                }
            }, 200);
        }, time);
    }
}

function convertToPlain(html){
    // Create a new div element
    var tempDivElement = document.createElement("div");

    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;

    // Retrieve the text property of the element
    return tempDivElement.textContent || tempDivElement.innerText || "";
}

function setCarat(element){
    element.focus()
    window.getSelection().selectAllChildren(element)
    window.getSelection().collapseToEnd()
}

//ensures that contenteditables dont get <br> added in when enter is pressed
input.onkeydown = function(e){
    if(e.code === 'Enter'){
        if(!e){
            e = window.event;
        }
        if(e.preventDefault){
            e.preventDefault();
        }
        else{
            e.returnValue = false;
        }
    }
    window.scrollTo(0, document.body.scrollHeight)
};

function print(text){
    console.log(text)
}

