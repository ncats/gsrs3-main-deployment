/**
* Author: Tyler Peryea
*
* This WIP library will help render synthetic schemes for G4SSM in GSRS via
* the cola and d3 libraries.
*/
var schemeUtil={};


schemeUtil.urlResolver=function(url, cb){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      cb(this.responseText);
    }else  if (this.readyState == 4 && this.status > 400) {
      cb("ERROR");
    }
  };
  xhttp.open('GET', url, true);
  xhttp.send();
};
schemeUtil.icons={
    'harrow':'<svg version="1.1" width="96" height="64" viewBox="-0.709 -0.235 213 71" xml:space="preserve"><defs></defs><polygon points="0,33 0,37 167.747,37 167.747,50.631 211.89,35 167.747,20 167.747,33 "></polygon></svg>',
    'varrow':"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='71' height='213' viewBox='-0.709 -0.235 71 213' enable-background='new -0.709 -0.235 71 213' xml:space='preserve'><defs xmlns=''/><polygon xmlns='http://www.w3.org/2000/svg' points='26.488,0 44.144,0 44.144,167.747 70.631,167.747 35.316,211.89 0,167.747 26.488,167.747'/></svg>",
    'plus': "<svg xml:space='preserve' enable-background='new -0.709 -0.235 211 211' viewBox='-0.709 -0.235 211 211' height='50' width='50' version='1.1' xmlns:a='http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns='http://www.w3.org/2000/svg'><defs></defs><polygon points='97.26563,210.54688  97.26563,113.08594  0,113.08594  0,97.07031  97.26563,97.07031  97.26563,0  112.89063,0  112.89063,97.07031  210.54688,97.07031  210.54688,113.08594  112.89063,113.08594  112.89063,210.54688  97.26563,210.54688  '/></svg>"
};
schemeUtil.svgResolver=function(c, cb){
    //this assumes it starts as an image URL
    var url=c.href.baseVal;
    //it's a real url
    if(url.indexOf('http')==0){
        schemeUtil.urlResolver(url,function(s){
            cb(s);
        });
    }else{
        var imgtag= c.getAttribute("imgTag");
        if(imgtag && schemeUtil.icons[imgtag]){
            cb(schemeUtil.icons[imgtag]);
        }
    }
};

schemeUtil.layout="horizontal";
schemeUtil.maxContinuousSteps=3;
schemeUtil.debug=true;
schemeUtil.apiBaseURL="";

schemeUtil.defaultImgSize=150;
schemeUtil.expectedImgPadding=70;

schemeUtil.showApprovalID=false;
schemeUtil.showReagents=true;
schemeUtil.showReagentsRoles=false;
schemeUtil.approvalCode="UNII";
schemeUtil.width=1500;
schemeUtil.height=2000;
schemeUtil.maxTextLen=19;
schemeUtil.maxTitleTextLen=50;
schemeUtil.showProcessNames=true;
schemeUtil.reactionWidth=96;
schemeUtil.reactionHeight=64;
schemeUtil.nodeSpacing=200;
schemeUtil.BREAK_GAP=100; //TODO MAKE DYNAMIC
schemeUtil.PLUS_GAP=20; //TODO MAKE DYNAMIC
schemeUtil.titleFontSize="1.6em";
schemeUtil.highlightColor="#429ecc";
schemeUtil.titleHighlightColor="#ff9900";
schemeUtil.textWidthPx=10;
schemeUtil.zoomLevel=1.2;
schemeUtil.getGapAxis = function(){
    if(schemeUtil.layout === "vertical"){
        return "x";
    }else{
        return "y";
    }
};
schemeUtil.getOtherGapAxis = function(){
    if(schemeUtil.layout === "vertical"){
        return "y";
    }else{
        return "x";
    }
};



schemeUtil.bracketRoleType="NON-ISOLATED INTERMEDIATE";


schemeUtil.onClickReaction=(d)=>{};
schemeUtil.onClickMaterial=(d)=>{};
schemeUtil.onFinishedLayout=(svg)=>{};

schemeUtil.rep = function(t, n) {
  var nn = "";
  for (var i = 0; i < n; i++) {
    nn += t;
  }
  return nn;
}
schemeUtil.maxLenAndOffset =function (txt, len) {
  if (!txt) return {"text":txt, "offset":0};

  if (txt.length < len) return {"text":txt, "offset":((len - txt.length) / 2 - 1)};

  return {"text": (txt.substr(0, len - 3) + "...") , "offset": 0 };
};

schemeUtil.maxLenSpacePad = function (txt, len) {
  if (!txt) return txt;
  if (txt.length < len) return schemeUtil.rep("\xa0", (len - txt.length) / 2 - 1) + txt;
  return txt.substr(0, len - 3) + "...";
};
schemeUtil.makeMaterialNode = function(smat, pidArr){
   var nn = {};
   nn.id = pidArr[0];
   pidArr[0]++;
   if(smat.verbatimName){
    nn.bottomText=smat.verbatimName;
   }else{
    nn.bottomText=smat.substanceName.refPname;
   }
   nn.name = smat.substanceName.approvalID;
   nn.type = "material";
   nn.refuuid = smat.substanceName.refuuid;
   if(!schemeUtil.debug){
    nn.img=schemeUtil.apiBaseURL + "substances/render(" + smat.substanceName.refuuid + ")?format=svg&size=150&stereo=false";
   }
   if(schemeUtil.showApprovalID){
     if (!nn.name) {
        nn.name = schemeUtil.approvalCode + ": Pending Record";
     } else {
        nn.name = schemeUtil.approvalCode + ": " + nn.name;
     }
   }
   if ((smat.substanceRole + "").toUpperCase() === schemeUtil.bracketRoleType) {
          nn.brackets = true;
   }
   return nn;
};
schemeUtil.makeDisplayGraph = function(g4, maxSteps, showReagents) {
  if(!maxSteps)maxSteps = schemeUtil.maxContinuousSteps;
  if(!showReagents)showReagents = schemeUtil.showReagents;

  var restartEachProcess=true;
  var showProcessNumber=true;

  var nodes = [];
  var links = [];
  var constraints = [];

  var canMap = {};
  var arrowGroups = [];
  var ppid = [0];

  var firstNodes=[];
  var firstNodeSizes=[];
  
  var topMostNodes=[];
  
  var lax=schemeUtil.getGapAxis();
  var oax=schemeUtil.getOtherGapAxis();
  
  for (var i = 0; i < g4.specifiedSubstanceG4m.process.length; i++) {
    var p = g4.specifiedSubstanceG4m.process[i];
    var processName = p.processName.trim();
    
    var stg = p.sites[0].stages;
    var pcanMap = {};
    if(restartEachProcess){
        canMap={};
    }
    var subSteps=0;
	var maxReagents=0;
    var addedNodes=[];
	var arrows=[];
    for (ii = 0; ii < stg.length; ii++) {
	  maxReagents=Math.max(stg[ii].startingMaterials.length,maxReagents);
	  maxReagents=Math.max(stg[ii].resultingMaterials.length,maxReagents);
      if(subSteps>=maxSteps){
        subSteps=0;
        pcanMap={};
        canMap={};
        if(addedNodes.length>0){
            firstNodes.push(addedNodes);
			firstNodeSizes.push(maxReagents);
			arrowGroups.push(arrows);
        }
        addedNodes=[];
		arrows=[];
		maxReagents=0;
      }
      subSteps++;
      var stage = stg[ii];
      var sms = stage.startingMaterials;
      var rms = stage.resultingMaterials;
      var prs = stage.processingMaterials;
      var smnodes = [];

      var nodesToAdd = [];


      //so we need to model a reaction.
      //first check if the substance is a candidate from other cases
      for (var iii = 0; iii < sms.length; iii++) {
		
	  
		var smat = sms[iii];
        var nn = pcanMap[smat.substanceName.refuuid];
        var newNode = false;
        if (typeof nn === "undefined") nn = canMap[smat.substanceName.refuuid];
        if (typeof nn === "undefined") {
          newNode = true;
          nn=schemeUtil.makeMaterialNode(smat,ppid);
          //first node in new process
          if(ii==0 && iii===0){
            nn.titleText = processName;
          }
        }
        if ((smat.substanceRole + "").toUpperCase() === schemeUtil.bracketRoleType) {
          nn.brackets = true;
        }
        //need to think about this in cases where there's more
        nn.siblingsRight = iii;
        nn.siblingsLeft = sms.length - iii - 1;
        if (newNode) {
          addedNodes.push(nn.id);
          nodesToAdd.push(nn);
        }
		if(subSteps===1){
			topMostNodes.push(nn);
		}
        smnodes.push(nn);
        if(smnodes.length>1){
            for(var j=smnodes.length-2;j<smnodes.length-1;j++){
                var con2={"axis":lax, "right":smnodes[j].id, "left":nn.id, "gap":schemeUtil.PLUS_GAP};
                constraints.push(con2);
            }
        }
        if (iii < sms.length - 1) {
          var pn = { type: "plus" };
          pn.siblingsRight = iii;
          pn.siblingsLeft = sms.length - iii - 1;
          pn.id = ppid[0];
          ppid[0]++;
          nodesToAdd.push(pn);
          smnodes.push(pn);
          var con={"axis":lax, "right":nn.id, "left":pn.id, "gap":schemeUtil.PLUS_GAP};
          constraints.push(con);
        }
      }
      nodesToAdd.reverse().map(nn=>nodes.push(nn));
      
      
      var stepText = "Step " + stage.stageNumber;
      var bottomText = "";


      if(showProcessNumber && g4.specifiedSubstanceG4m.process.length>1){
        stepText = p.processName.trim() + ": " +stepText;
      }

      if(showReagents){
        stepText = prs.filter(f=>f.substanceRole.toLowerCase() !== "solvent")
    .map(f=>((f.verbatimName)?(f.verbatimName):f.substanceName.refPname) + ((schemeUtil.showReagentsRoles)?(' (' + f.substanceRole + ')'):''))
                      .join("\n");
        bottomText = prs.filter(f=>f.substanceRole.toLowerCase() === "solvent")
    .map(f=>((f.verbatimName)?(f.verbatimName):f.substanceName.refPname) + ((schemeUtil.showReagentsRoles)?(' (' + f.substanceRole + ')'):''))
                      .join("\n");
      }


      var rn = { type: "reaction", leftText: stepText, bottomText: bottomText};

      rn.processIndex=i;
      rn.stepIndex=ii;
      rn.id = ppid[0];
      ppid[0]++;
      nodes.push(rn);
	  arrows.push(rn);
      for (var j = 0; j < smnodes.length; j++) {
        var lin = {};
        lin.source = smnodes[j].id;
        lin.target = rn.id;
        lin.value = 1;
        links.push(lin);
      }
      for (var iiii = 0; iiii < rms.length; iiii++) {
        var rmat = rms[iiii];
        var nn = canMap[rmat.substanceName.refuuid];
        var newNode = false;
        if (typeof nn === "undefined") {
          newNode = true;
          nn=schemeUtil.makeMaterialNode(rmat,ppid);
        }
        if ((rmat.substanceRole + "").toUpperCase() === schemeUtil.bracketRoleType) {
          nn.brackets = true;
        }
        //need to think about this in cases where there's more
        nn.siblingsRight = iiii;
        nn.siblingsLeft = rms.length - iiii - 1;
        if (newNode) {
          addedNodes.push(nodes.length);
          nodes.push(nn);
        }

        pcanMap[rmat.substanceName.refuuid] = nn;
        var lin = {};
        lin.source = rn.id;
        lin.target = nn.id;
        lin.value = 1;
        links.push(lin);
        if (iiii < rms.length - 1) {
          var pn = { type: "plus" };
          pn.siblingsRight = iiii;
          pn.siblingsLeft = rms.length - iiii - 1;
          pn.id = ppid[0];
          ppid[0]++;
          nodes.push(pn);

          var lin2 = {};
          lin2.source = rn.id;
          lin2.target = pn.id;
          lin2.value = 1;
          links.push(lin2);
        }
      }

      if (ii == stg.length - 1) {
        var ks = Object.keys(pcanMap);
        ks.map((kk) => (canMap[kk] = pcanMap[kk]));
      }
    }
    if(addedNodes.length>0){
        firstNodes.push(addedNodes);
		firstNodeSizes.push(maxReagents);
		arrowGroups.push(arrows);
    }
  }



  //calculate constraints
  
  for(var jj=0;jj<firstNodes.length;jj++){
    var nlist1=firstNodes[jj];

	var mR1=firstNodeSizes[jj];


    for(var kk=jj+1;kk<firstNodes.length;kk++){
        var nlist2=firstNodes[kk];
		var mR2=firstNodeSizes[kk];
		
		var gapPer= schemeUtil.defaultImgSize+schemeUtil.expectedImgPadding;
		

		var gapDist = gapPer*mR1*0.5 +  gapPer*mR2*0.5 +schemeUtil.BREAK_GAP ;
        for(var ll=0;ll<nlist1.length;ll++){
            for(var mm=0;mm<nlist2.length;mm++){
                var con={"axis":lax, "left":nlist1[ll], "right":nlist2[mm], "gap":gapDist};
                constraints.push(con);
            }
        }
    }
  }
  
  var nodeOff = topMostNodes.map(nn=>{return {"node":nn.id, "offset":0}});
  var con3={"type":"alignment", "axis":oax, "offsets":nodeOff};
  constraints.push(con3);
  
  arrowGroups.map(ag=>{
	var nodeOff = ag.map(nn=>{return {"node":nn.id, "offset":0}});
	var con3={"type":"alignment", "axis":lax, "offsets":nodeOff};
	constraints.push(con3);
  });
  
  var ret=JSON.parse(JSON.stringify({ nodes: nodes, links: links, constraints: constraints }));
  return ret;
}


schemeUtil.renderScheme=function(nn2, selector, iter, ddx, ddy) {

  if((typeof iter) === "undefined"){
    //do 2 iterations
    iter=1;
  }


  var cheight = schemeUtil.defaultImgSize;
  var pwidth = 32;
  var maxText = schemeUtil.maxTextLen;
  var width = schemeUtil.width;
  var height = schemeUtil.height;
  var paddingBrack = 6;
  var imageScale=1;



  function toggleImageZoom(img) {
        var scale = 1;
        d3.select(img).each(function (d) {
            if (Math.abs(img.width.baseVal.value - d.width) < 1) scale /= imageScale;
        });
        imageZoom(img, scale);
  }

  function imageZoom(img, scale) {
        d3.select(img)
            .transition()
            .attr("width", function (d) {
                var nwid = scale * (cheight);
                return nwid;
            })
            .attr("height", function (d) { return scale * (cheight); });
  }

  var ss = d3.scaleOrdinal(d3.schemeCategory20);

  var getImg = (n) => {
    if (n.type === "reaction") {
      if(schemeUtil.layout === "horizontal"){
        return "data:image/png;base64,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AEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxAQWAEBMYAEAxG6860+AffBJs1svvTwTb5n96aWXAAAAAAAAAAAAAAAAAAAAAABcqBtu+B+bwRqCuT/22AAAAABJRU5ErkJggg==";
      }else {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAQAAAAUb1BXAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfjCwkXKBl2gw6IAAAMZUlEQVR42u3dbcjddR3H8e81vbK8WahpaFLaDSFiWzeG3epsDpMaKeJNGEHQg0BKEoKoB8GMih4GkWUsjSCIqKEtIYLQVrMsJbxZokVTr1WUc8PcbF2zB1pi7ea6Oed8z+ec1+v7dOD39xu8d52z/39WAQAAAAAAAACMpZnuBYh0Vp25qF9/b23rXhmYVhvqmUXNZ7oXZjKs6F4AYKEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAM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";
      }
    } else if (n.img) {
      return n.img;
    } else if (n.type === "plus") {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA0gAAANICAIAAAByhViMAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAUPElEQVR4nO3dwW1dOYKG0WbjJkClUGk4F0ejlVA5OJQKwOtKgyFwAijMnQfKb/zq0zlbNe+vBVH4wAbksff+z6m11vHZOaddu3bt2rVr167dX7j73+OTAAC8FGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAirrXW8eE55/FZu3bt2rVr165du79214sdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAxPW7fwHgWd7f3//888/f/Vvwcr5///7jx4/f/VsAT+HFDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIOKacx4fXmsdn7Vr1+6zd8cYx18mbO99f+te8z7btWv3EV7sAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIi41lrHh+ecx2ft2rX77N299/GXCRtj3N+617zPdu3afYQXOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAirjnn8eG11vFZu3btPnt3jHH8ZcL23ve37jXvs127dh/hxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiGutdXx4znl81q5du8/e3Xsff5mwMcb9rXvN+2zXrt1HeLEDAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIOKacx4fXmsdn7Vr1+6zd8cYx18mbO99f+te8z7btWv3EV7sAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIi41lrHh+ecx2ft2rX77N299/GXCRtj3N+617zPdu3afYQXOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAirjnn8eG11vFZu3btPnt3jHH8ZcL23ve37jXvs127dh/hxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiGutdXx4znl81q5du8/e3Xsff5mwMcb9rXvN+2zXrt1HeLEDAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIOKacx4fXmsdn7Vr1+6zd8cYx18mbO99f+te8z7btWv3EV7sAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIi41lrHh+ecx2ft2rX77N299/GXCRtj3N+617zPdu3afYQXOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAirjnn8eG11vFZu3btPnt3jHH8ZcL23ve37jXvs127dh/hxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiGutdXx4znl81q5du8/e3Xsff5mwMcb9rXvN+2zXrt1HeLEDAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIOKacx4fXmsdn7Vr1+6zd8cYx18mbO99f+te8z7btWv3EV7sAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIi41lrHh+ecx2ft2rX77N299/GXCRtj3N+617zPdu3afYQXOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAirjnn8eG11vFZu3btPnt3jHH8ZcL23ve37jXvs127dh/hxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACDiet6n39/fb376mb+Jv/c+PmvX7tfZ/euvv46/TNjPnz/999mu3d+7+/Hxcfzl/2P3M7/0/T958fb2dvxlAICq+/ryT4oBACDsAAAqhB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiOszfwRvzvkLfxUAgK/gvr4+01de7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIGHvv48NrrZufvr29HX8ZAKDqvr7u++qeFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIq611vHhOecv/FUAAL6C+/r6TF95sQMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgYuy9jw+vtW5++vb2dvxlAICq+/q676t7XuwAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiLjWWseH55y/8FcBAPgK7uvrM33lxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiLH3Pj681rr56dvb2/GXAQCq7uvrvq/uebEDAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIOJaax0fnnP+wl8FAOAruK+vz/SVFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIsbe+/jwWuvmp29vb8dfBgCouq+v+76658UOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgIhrrXV8eM75C38VAICv4L6+PtNXXuwAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAEHE979Pfv3+/+ene+/jLY4zjs3btfp3dnz9//v3338cfp+qPP/749u3bzf/gNe+zXbtfZ/cznhh2P378uPnp7/oXL+za/Tq77+/vwo5/+vbtm/8+27X7yruf4f+KBQCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiLi+2l9ztmv36+x+5h/DIWzvfX/rXvM+27Vr9xFe7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIuNZax4fnnMdn7dq1++zdvffxlwkbY9zfute8z3bt2n2EFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIq455/HhtdbxWbt27T57d4xx/GXC9t73t+4177Ndu3Yf4cUOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgIhrrXV8eM55fNauXbvP3t17H3+ZsDHG/a17zfts167dR3ixAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACDimnMeH15rHZ+1a9fus3fHGMdfJmzvfX/rXvM+27Vr9xFe7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIuNZax4fnnMdn7dq1++zdvffxlwkbY9zfute8z3bt2n2EFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIq455/HhtdbxWbt27T57d4xx/GXC9t73t+4177Ndu3Yf4cUOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgIhrrXV8eM55fNauXbvP3t17H3+ZsDHG/a17zfts167dR3ixAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACDimnMeH15rHZ+1a9fus3fHGMdfJmzvfX/rXvM+27Vr9xFe7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIuNZax4fnnMdn7dq1++zdvffxlwkbY9zfute8z3bt2n2EFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIq455/HhtdbxWbt27T57d4xx/GXC9t73t+4177Ndu3Yf4cUOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgIhrrXV8eM55fNauXbvP3t17H3+ZsDHG/a17zfts167dR3ixAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACDimnMeH15rHZ+1a9fus3fHGMdfJmzvfX/rXvM+27Vr9xFe7AAAIoQdAECEsAMAiBB2AAARwg4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIuNZax4fnnMdn7dq1++zdvffxlwkbY9zfute8z3bt2n2EFzsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCACGEHABAh7AAAIq455/HhtdbxWbt27T57d4xx/GXC9t73t+4177Ndu3Yf4cUOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAg4vrdvwDwLB8fHx8fH//bT/+Nf1Hd7v/PLvDv5cUOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAg4vo3/lV0u3bt2rVr165du//kxQ4AIELYAQBECDsAgAhhBwAQIewAACKEHQBAhLADAIgQdgAAEcIOACBC2AEARAg7AIAIYQcAECHsAAAihB0AQISwAwCIEHYAABHCDgAgQtgBAEQIOwCAiP8BtbEu97u9xo4AAAAASUVORK5CYII=";
    } else {
      return "https://upload.wikimedia.org/wikipedia/commons/1/16/NNK_chemical_structure.svg";
    }
  };

  var getTag = (n) => {
    if (n.type === "reaction") {
      if(schemeUtil.layout === "horizontal"){
        return "harrow";
      }else {
        return "varrow";
      }
    } else if (n.img) {
      return n.img;
    } else if (n.type === "plus") {
      return "plus";
    } else {
      return "placeholder";
    }
  };

  var getLeftText = (n) => {
    if (n.leftText) {
      return n.leftText;
    } else {
      return "";
    }
  };
  var getLeftTextHeight = (n) => {
    return 32*getLeftText(n).split("\n").length;
  };

  var getLeftTextSVG = (n) => {
    var txt= getLeftText(n);
    if(txt==="")return "";
    var lines = txt.split("\n");
    var first = -1.2*lines.length;
    var len = schemeUtil.maxTextLen;
    
    return lines
                   .map(t=>(t.length>len)?(t.substr(0, len - 3) + "..."):t)
                   .map((t,i)=>"<tspan x=\"0\" dy=\"" + ((i===0)?(first+""):"1.2")+  "em\">" + t + "</tspan>").join("\n");;
  };
  
    var getBottomTextSVG = (n) => {
    var txt=getBottomText(n);
    var off=(getHeight(n)-0)+20;

    if(txt==="")return "";
    var lines = txt.split("\n");
    var first = off + "px";
    var len = schemeUtil.maxTextLen;

    return lines
                   .map(t=>(t.length>len)?(t.substr(0, len - 3) + "..."):t)
                   .map((t,i)=>"<tspan x=\"0\" dy=\"" + ((i===0)?(first+""):"1.2em")+  "\">" + t + "</tspan>").join("\n");
  };
  
  var getBottomText = (n) => {
    if (n.bottomText) {
      return n.bottomText;
    } else {
      return "";
    }
  };
  var getTitleText = (n) => {
    if (n.titleText) {
      return n.titleText;
    } else {
      return "";
    }
  };
  var getBottomTextSVG = (n) => {
    var txt=getBottomText(n);
    var off=(getHeight(n)-0)+20;

    if(txt==="")return "";
    var lines = txt.split("\n");
    var first = off + "px";
    var len = schemeUtil.maxTextLen;

    return lines
                   .map(t=>(t.length>len)?(t.substr(0, len - 3) + "..."):t)
                   .map((t,i)=>"<tspan x=\"0\" dy=\"" + ((i===0)?(first+""):"1.2em")+  "\">" + t + "</tspan>").join("\n");
  };
  
  var getTitleTextSVG = (n) => {
    var txt=getTitleText(n);
    var off="-60";

    if(txt==="")return "";
    var lines = txt.split("\n");
    var first = off + "px";
    var len = schemeUtil.maxTitleTextLen;
    var xoff = "-40px";

    return lines
                   .map(t=>(t.length>len)?(t.substr(0, len - 3) + "..."):t)
                   .map((t,i)=>"<tspan x=\"" + xoff + "\" dy=\"" + ((i===0)?(first+""):"1.2em")+  "\">" + t + "</tspan>").join("\n");
  };

  var getWidth = (n) => {
    if (n.type === "reaction") {
      return schemeUtil.reactionWidth + "";
    } else if (n.imgWidth) {
      return n.imgWidth;
    } else if (n.type === "plus") {
      return pwidth/2  + "";
    } else {
      return cheight  + "";
    }
  };
  var getWidthPx = (n) => {
    return getWidth(n).replace("px", "") - 0;
  };
  var getHeightPx = (n) => {
    return getHeight(n).replace("px", "") - 0;
  };
  var getBracketWidth = (n) => {
    if (n.brackets) return 1;
    return 0;
  };
  var getBracketVisibility =  (n) => {
    if (n.brackets) return "visible";
    return "hidden";
  };
  var getHeight = (n) => {
    if (n.type === "reaction") {
      return schemeUtil.reactionHeight + "";
    } else if (n.imgHeight) {
      return n.imgHeight;
    } else if (n.type === "plus") {
      return pwidth/2 + "";
    } else {
      return cheight + "";
    }
  };
  var getX = (n) => {
    var ww = getWidthPx(n);
    var pad = 0;

    if(schemeUtil.layout === "vertical"){
      if (n.siblingsLeft) {
        pad -= (ww * n.siblingsLeft) / 2 + n.siblingsLeft * pwidth;
      }
      if (n.siblingsRight) {
        pad += (ww * n.siblingsRight) / 2 + n.siblingsRight * pwidth;
      }
      if (n.type === "plus") pad = 0;
    }

    return n.x - ww / 2 + pad;
  };
  var getY = (n, dy) => {
    var hh = getHeightPx(n);
    if(!dy)dy=0;
    var pad = 0;

    if(schemeUtil.layout === "horizontal"){
      if (n.siblingsLeft) {
        pad -= (hh * n.siblingsLeft) / 2 + n.siblingsLeft * pwidth;
      }
      if (n.siblingsRight) {
        pad += (hh * n.siblingsRight) / 2 + n.siblingsRight * pwidth;
      }
      if (n.type === "plus") pad = 0;
    }
    return n.y - hh / 2  + pad + dy;
  };
  d3.select(selector).select('svg').remove();

  var d3cola = cola.d3adaptor(d3)
                   .avoidOverlaps(true)
                   .size([width, height]);
  var svgParent = d3
    .select(selector)
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);
    //.attr("width", width)
    //.attr("height", height);

  var svg= svgParent
    .append("g")
    .attr("id", "full-scheme");

  if(iter===0){
    svgParent.call(d3.zoom().on("zoom", function () {
       svg.attr("transform", d3.event.transform)
    }));
  }

  var wrap = {
    load: function (a, b) {
      b(null, a);
    }
  };

  wrap.load(nn2, function (error, graph) {
    var nodeRadius = 5;

    graph.nodes.forEach(function (v) {
      v.height = v.width = 2 * nodeRadius;
    });

    var layoutVar = "y";
    if(schemeUtil.layout === "horizontal"){
      layoutVar="x";
    }





    try{
      d3cola
        .nodes(graph.nodes)
        .links(graph.links)
        .constraints(graph.constraints)
        .flowLayout(layoutVar, schemeUtil.nodeSpacing)
        .avoidOverlaps(false)
        .symmetricDiffLinkLengths(6)
        .start(10, 20, 20);
    }catch(e){
      //the rendering failed for some reason, trigger the ending event
      //and return
      schemeUtil.onFinishedLayout(null);
      return;
    }
    var path = svg
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("svg:path")
      .attr("class", "link");

    var mnode = svg
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", function (d, i) {
        if (d.type === "reaction") {
          schemeUtil.onClickReaction(d);
          //do reaction stuff
        } else if (d.type === "material") {
          schemeUtil.onClickMaterial(d);
        }
      })
      .on("mouseover", function (d, i) {
        d3.select(this).style("cursor", "pointer");

      })
      .on("mouseout", function (d, i) {
        d3.select(this).style("cursor", "default");

      })
      .call(d3cola.drag);

    mnode
      .append("text")

      .attr("dy", (d) => 0)
      .attr("dx", (d) => (d.type!=="reaction")?(schemeUtil.textWidthPx * schemeUtil.maxLenAndOffset(d.bottomText, maxText).offset):0)
      .attr("font-family", "monospace")
      .attr("fill", schemeUtil.highlightColor)
      .attr("font-weight", "bold")
      .attr("text-decoration","underline")
      .html(function (d) {
        return getBottomTextSVG(d);
      });
      
    mnode
      .append("text")
      .attr("dy", (d) => 0)
      .attr("dx", (d) => 0)
      .attr("font-family", "monospace")
      .attr("font-size", schemeUtil.titleFontSize)
      .attr("fill", schemeUtil.titleHighlightColor)
      .attr("font-weight", "bold")
      .attr("text-decoration","underline")
      .html(function (d) {
        return getTitleTextSVG(d);
      });
      

    mnode
      .append("text")
      .attr(
        "dx",
        (d) => {
            if(schemeUtil.layout === "vertical"){
                return -1 * schemeUtil.textWidthPx * getLeftText(d).length - getWidth(d).replace("px", "");
            }else{
                return 0;
            }
        }
      )
      .attr("dy", (d) => {
            if(schemeUtil.layout === "vertical"){
                return (getHeight(d).replace("px", "")-0) / 2;
            }else{
                return -1* ((getHeight(d).replace("px", "")-getLeftTextHeight(d)));
            }
        }
      )
      .attr("font-family", "monospace")
      .attr("fill", schemeUtil.highlightColor)
      .attr("font-weight", "bold")
      .attr("text-decoration","underline")
      .html((d) => getLeftTextSVG(d));


    mnode
      .append("text")
      .text(function (d) {
        return schemeUtil.maxLenAndOffset(d.name, maxText).text;
      })
      .attr("dx", (d) => schemeUtil.textWidthPx * schemeUtil.maxLenAndOffset(d.name, maxText).offset)
      .attr("dy", -20)
      .attr("font-family", "monospace");

    //long left
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", -paddingBrack)
      .attr("y1", -paddingBrack)
      .attr("x2", -paddingBrack)
      .attr("y2", (d) => getHeightPx(d) + paddingBrack);

    //left bracket top
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", -paddingBrack)
      .attr("y1", -paddingBrack)
      .attr("x2", 0)
      .attr("y2", -paddingBrack);
    //left bracket bottom
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", -paddingBrack)
      .attr("y1", (d) => getHeightPx(d) + paddingBrack)
      .attr("x2", 0)
      .attr("y2", (d) => getHeightPx(d) + paddingBrack);
    //long right
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", (d) => getWidthPx(d) + paddingBrack)
      .attr("y1", -paddingBrack)
      .attr("x2", (d) => getWidthPx(d) + paddingBrack)
      .attr("y2", (d) => getHeightPx(d) + paddingBrack);

    //Right bracket top
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", (d) => getWidthPx(d) + paddingBrack)
      .attr("y1", -paddingBrack)
      .attr("x2", (d) => getWidthPx(d))
      .attr("y2", -paddingBrack);
    //Right bracket bottom
    mnode
      .append("line")
      .style("stroke", "black")
      .style("stroke-width", (d) => getBracketWidth(d))
      .style("visibility", (d) => getBracketVisibility(d))
      .attr("x1", (d) => getWidthPx(d) + paddingBrack)
      .attr("y1", (d) => getHeightPx(d) + paddingBrack)
      .attr("x2", (d) => getWidthPx(d))
      .attr("y2", (d) => getHeightPx(d) + paddingBrack);

    var node = mnode
      .append("svg:image")

      .attr("class", "node")
      .attr("xlink:href", (d) => getImg(d))
      .attr("imgTag", (d) => getTag(d))
      .attr("width", (d) => getWidth(d))
      .attr("height", (d) => getHeight(d))
      .attr("r", nodeRadius);

    d3cola
     .on('end', function() {
        if(iter>0){
            var bboxn = svg.node();
            if(bboxn){
                var bbox=bboxn.getBBox();
                schemeUtil.renderScheme(nn2, selector, iter - 1, 0, -bbox.y);
            }
        } else{
                var numIMG=document.querySelectorAll('image.node').length;
                var tickDownFunction = ()=>{
                    numIMG--;
                    if(numIMG==0){
                       schemeUtil.onFinishedLayout(svg);
                    }
                };
                document.querySelectorAll('image.node').forEach(c=>{
                  schemeUtil.svgResolver(c, function(foundSvg){
                    if(foundSvg==="ERROR"){
                        tickDownFunction();
                    }else{
                        var svgGot = foundSvg.replaceAll(/[<][?]xml[^>]*>/g,'')
                        var tsvg=document.createElement('g')
                        tsvg.innerHTML=svgGot;
                        var elm=tsvg.firstElementChild;
                        elm.setAttribute('width',c.getAttribute('width'));
                        elm.setAttribute('height',c.getAttribute('height'));
                        c.parentElement.appendChild(elm);
                        c.remove();
                        tickDownFunction();
                    }
                  });
                });

        }
     })
     .on("tick", function () {
      path.each(function (d) {
        if (schemeUtil.isIE()) this.parentNode.insertBefore(this, this);
      });



      // draw directed edges with proper padding from node centers
      path.attr("d", function (d) {
        var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = nodeRadius,
          targetPadding = nodeRadius + 2,
          sourceX = d.source.x + sourcePadding * normX,
          sourceY = d.source.y + sourcePadding * normY,
          targetX = d.target.x - targetPadding * normX,
          targetY = d.target.y - targetPadding * normY;
        return "M" + sourceX + "," + sourceY + "L" + targetX + "," + targetY;
      });


      mnode.attr(
        "transform",
        (d) => "translate(" + getX(d) + "," + (getY(d,ddy)) + ")"
      );



    });
  });
}
schemeUtil.isIE = function() {
  return (
    navigator.appName == "Microsoft Internet Explorer" ||
    (navigator.appName == "Netscape" &&
      new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(
        navigator.userAgent
      ) != null)
  );
}
