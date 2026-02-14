var nihonngos = document.querySelectorAll('.nihonngo');

for (let i = 0; i < nihonngos.length; i++) {
    let nihonngo = nihonngos[i];
    nihonngo.id = `nihonngo_${i}`;
    let hide_kana = nihonngo.getAttribute('hide-kana');
    let hide_acc = nihonngo.getAttribute('hide-acc');
    let height = nihonngo.getAttribute('height');
    const text = nihonngo.textContent;
    // Parsing
    let blocks = [], todos = [], kana = [];    
    let sentence = '';
    let state = 0; // 0 not parse, 1 parse kanji, 2 parse kana
    for (let i = 0; i < text.length; i++) {
        let acc;
        if (i === text.length - 1) acc = 0;
        else if (text[i+1] === '|' && text[i+2] === '|') acc = 2; // || plain
        else if (text[i+1] === '|' && text[i+2] !== '|') acc = 1; // |  top
        //console.log(acc);
        if (text[i] === '{') {
            blocks.push(sentence);
            state = 1;
            sentence = '';
        }
        else if (text[i] === '|' || text[i] === '/')
            continue;
        else if (state === 2) {
            if (text[i] === '}') {
                todos.push({under: sentence, top: kana, idx: blocks.length});
                blocks.push(sentence);
                state = 0;
                sentence = '';
                kana = [];
            }
            else {
                kana.push({content: text[i], acc: acc});
            }
        }   
        else if (state === 1) {
            if (text[i] === ',')
                state = 2;
            else
                sentence += text[i];
        }
        else  // Normal content have one span per char
            blocks.push({content: text[i], acc: acc});
    }
    nihonngo.textContent = '';
    console.log(blocks);

    // Create Children
    var space;
    for (let i = 0, j = 0; i < blocks.length; i++) {
        if (blocks[i].content === '\n') {
            if (i == blocks.length - 1 || blocks[i+1].content === '\n')
                continue; // Skip unimportant \n
            if (i) {
                let temp = document.createElement("br");
                nihonngo.appendChild(temp);
            }
            space = document.createElement("div");
            nihonngo.appendChild(space);
            
        }
        else if (blocks[i] === "")
            continue;
        else if (j < todos.length && todos[j].idx == i) {
            // Add kanji
            let _ruby = document.createElement("ruby");
            _ruby.appendChild(document.createTextNode(todos[j].under));
            // Add kana
            if (hide_kana !== 'true') {
                let _rt = document.createElement("rt");
                for (let k = 0; k < todos[j].top.length; k++) {
                    let text = document.createElement("span");
                    text.appendChild(document.createTextNode(todos[j].top[k].content));
                    if (hide_acc !== 'true')
                        if (todos[j].top[k].acc == 1)
                            text.className = 'accent_top';
                        else if (todos[j].top[k].acc == 2)
                            text.className = 'accent_plain';
                    _rt.appendChild(text);
                }
                _ruby.appendChild(_rt);
            }
            space.appendChild(_ruby);
            j++;
        }
        else {
            let text = document.createElement("span");
            text.appendChild(document.createTextNode(blocks[i].content));
            text.style.display = 'inline-block';
            text.style.marginTop = height ? height : '1rem'; // Control line spacing
            text.style.marginBottom = height ? height : '1rem'; // Control line spacing 
            text.style.height = '0.75rem'; // Control accent heights
            // Add accent
            if (hide_acc !== 'true')
            if (blocks[i].acc == 1)
                text.className = 'accent_top';
            else if (blocks[i].acc == 2)
                text.className = 'accent_plain';
            space.appendChild(text);
        }
    }
}