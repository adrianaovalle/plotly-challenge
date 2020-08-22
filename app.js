//------------------Belly Button Biodeversity Dashboard-------------------------

// 1. Generate DropDown Menu----------------------------------------------------
function dropDownMenu () {
//Use D3 to read the JSON file
d3.json("data/samples.json").then((Data)=>{
        const names=Data.names;
    
// Set the dropdown button with names
    d3.select("#selDataset")
        .selectAll("option")
        .data(names)
        .enter()
        .append("option")
        .html(function(d) {
            return d;});
})
};
dropDownMenu();

// 2. Create function that generates the plots based on selected subject_ID-------
function buildPlots(subject_ID){
    console.log(subject_ID);

    //Use D3 to read JSON file
    d3.json("data/samples.json").then((Data)=>{
        const samples=Data.samples;
        console.log(samples);
        const metadata=Data.metadata;
        console.log(metadata);


        //Filter objects by subject_ID
        //Samples data
        let selectedSubject=samples.filter(i=> 
            i.id===subject_ID);
        console.log(selectedSubject);
        
        //Metadata
        let demographics=metadata.filter(i=>
            i.id.toString()===subject_ID);
        let  infoSubject=demographics[0];
        console.log(demographics);
        console.log(infoSubject)

        // Get data for subject_ID for Plot 1
        let otuIDs=selectedSubject[0].otu_ids.slice(0,10);
        let sampleValues=selectedSubject[0].sample_values.slice(0,10);
        let otuLabels=selectedSubject[0].otu_labels.slice(0,10);
        let otuLabelsSplit=otuLabels.map(i=>i.split(";").slice(-1));
        
        console.log(otuIDs);
        console.log(otuLabels);
        console.log(otuLabelsSplit);
        console.log(sampleValues);

        //Build labels
        let labels=[];
        otuIDs.forEach((d,i)=>{ 
            labels.push(d+ ": " + otuLabelsSplit[i]);
        });
        console.log(labels);

        //---------------Plot 1: Prepare data for plotting-------------------
        let trace1 = {
                    x: sampleValues.reverse(),
                    y: labels.reverse(),
                    type: "bar",
                    orientation: "h",
                    hovertext: labels.reverse(), 
                    marker: {
                        color: 'darkgrey'
                      },

                    
                  
                };
            
        let traceData = [trace1];
            
        let layout = {title: `Top 10 Bacteria - Subject ${subject_ID}`,
                        font: {
                            family: 'Tahoma',
                            color: 'grey'
                        },
                        height: 600,
                        width: 800,
                        xaxis:{tickfont: {size:12},
                                // title: "Values",
                                size: 20},
                        yaxis:{tickfont: {size: 10}},
                        margin: {
                            l: 150,
                            r: 100,
                            t: 40,
                            b: 20
                        }
                    };                  
        Plotly.newPlot ("bar2",traceData,layout);

        //------------------Plot 2 :  Prepare data for plotting------------------
        let IdObject={};
        let labelObject={};

        // Loop over each sample to get the data
        samples.forEach(sample =>{
            const ID=sample.otu_ids;
            const Values=sample.sample_values;
            const labels=sample.otu_labels;
            const simpleLabel=labels.map(l=>l.split(";").slice(-1));

            // Loop over every otu_ID
            ID.forEach((id,i) =>{
                if (id in IdObject){
                    IdObject[id].push(Values[i]);
                    labelObject[id].push(simpleLabel[i])
                }
                else {
                    IdObject[id]=[Values[i]];
                    labelObject[id]=[simpleLabel[i]];
                }

            });

        });

        console.log(IdObject);
        console.log(labelObject);

        // Aggregate values
        let aggregatedData={}
        Object.entries(IdObject).forEach(([key,value])=>{
            let reducer=(accumulator,currentValue)=>accumulator+currentValue;
            let agg=value.reduce(reducer);
            if (key in aggregatedData){
                aggregatedData[key].push(agg);
            }
            else{
                aggregatedData[key]=agg;
            }
        });
        console.log(aggregatedData);

        //Sort and slice to top 10 values
        let results=Object.entries(aggregatedData);
        let sortedResults=results.sort(function(a,z){
            return z[1]-a[1];
        });
        sortedResults=sortedResults.slice(0,10);
        console.log(sortedResults);

        //Labels for the top 10 values
        sortedResults.forEach(r=>{ 
            Object.entries(labelObject).forEach(([key,value])=>{
                if (r[0]===key){
                    r.push(value[0]);
                    r.push(key + ": "+value[0]);
                }
            })
            });
        console.log(sortedResults);

        // Create Plot
        let trace2 = {
            x: sortedResults.map(r=>r[1]).reverse(),
            y: sortedResults.map(r=>r[3]).reverse(),
            type: "bar",
            orientation: "h",
            hovertext: sortedResults.map(r=>r[2]).reverse(), 
            marker: {
                color: 'red'
              },

            
          
        };
    
        let traceData2 = [trace2];
    
        let layout2 = {title: "Top 10 Bacteria - All Subjects",
                font: {
                    family: 'Tahoma',
                    color: 'red'
                },
                height: 600,
                width: 800,
                xaxis:{tickfont: {size:12},
                        // title: "Values",
                        size: 20
                        },
                yaxis:{tickfont: {size: 10}},
                margin: {
                    l: 150,
                    r: 100,
                    t: 40,
                    b: 20
                }
            };                  
        Plotly.newPlot ("bar1",traceData2,layout2);
//------------------Plot 3 :  Bubble Plot------------------
let allOtuIds=selectedSubject[0].otu_ids;
let allSampleValues=selectedSubject[0].sample_values;
let allOtuLabels=selectedSubject[0].otu_labels;
let familyLabels=allOtuLabels.map(l=>l.split(";").slice(0,5));
console.log(allOtuLabels);
console.log(familyLabels);

//Create object with labels as keys and sample_values as values
let Family={};
familyLabels.forEach((f,i)=>{
  if (f in Family){
      Family[f].push(allSampleValues[i])
  } 
  else{
      Family[f]=[allSampleValues[i]];
  }
});
console.log(Family);

// Aggregate each family's value
let familyAgg={};
Object.entries(Family).forEach(([key,value])=>{
    let freducer=(cum,value)=>cum+value;
    let aggFam=value.reduce(freducer);
    console.log(aggFam);
    if (key in familyAgg){
        familyAgg[key].push(aggFam);
    }
    else{
        familyAgg[key]=aggFam;
    }
});
console.log(familyAgg);

//Sort results
let sortedFamily=Object.entries(familyAgg).sort((a,z)=>{
    return z[1]-a[1]});
let xvalues=sortedFamily.map(s=>s[1]);
let yvalues=sortedFamily.map(s=>s[0]);

// //Create Bubble Plot
bubble_trace = {
    x: xvalues,
    y: yvalues,
    mode: "markers",
    marker: {
        size: xvalues,
    },
    text: familyLabels
};

let bubble_data = [bubble_trace];

// Set layout
bubble_layout = {
    title: `Count of Bacteria by Family - Subject ${subject_ID}`,
    font: {
        family: 'Tahoma',    },
    showlegend: false,
    height: 500,
    width: 1200,
    
};

Plotly.newPlot("bubble", bubble_data, bubble_layout);


//---------------------Fill out the Demographic Information---------------
        d3.select("#sample-metadata").text("");
        let info=d3.select("#sample-metadata")
        Object.entries(infoSubject).forEach(([key,value]) =>{
            let elem = info.append("p")
            elem.html(`<b>${key.toUpperCase()}</b>:
            ${value}`);
        })
    })
};

// 3. Update page with selected subject_ID-------------------------------------
function optionChanged (subject_ID){
    console.log(subject_ID);
    buildPlots(subject_ID);

};

//4. Initialize with first subject_ID
function init(){
    buildPlots("940");
};

init();


