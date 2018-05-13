<script>
//全局变量
var xScale,yScale,body,margin,zoom,
    brusher,graphcontainerwrap,rect,brush,graphcontainer,kxFlage=false,width=1000,
    height=600
    ,nodeg,lineg,force,nodes,links,svg_links,nodeitemg,tick;

//d:当前数据{name: "厦门", index: 2, weight: 1, x: 466.6813858732468, y: 237.10472023203738, …}
//i:下标，比如2
function dragstart(d, i) {
    force.stop(); //让力导向图停止tick模拟
    d3.event.sourceEvent.stopPropagation();
    if (!d.selected) {//当前拖拽的node没有被选中
        nodeitemg.classed("selected", function(p) {
            return p.selected =  p.previouslySelected = false;
        });
    }

    d3.select(this).classed("selected", function(p) {
        d.previouslySelected = d.selected;
        return d.selected = true;
    });

    nodeitemg.filter(function(d) {
            return d.selected;
        })
      //d3里面的函数：selection.each(fn)为selection的每个元素调用用指定函数fn，
          //传递当前数据d和索引i，与当前的DOM元素的this上下文
      .each(function(d) {
          d.fixed |= 2;
      });
}

function dragmove(d, i) {
    nodeitemg.filter(function(d) {
        return d.selected;
    })
        .each(function(d) {
            console.log(d);
            d.x += d3.event.dx;
            d.y += d3.event.dy;

            d.px += d3.event.dx;
            d.py += d3.event.dy;
        });
        tick();
}

function dragend(d, i) {
    nodeitemg.filter(function(d) {
        return d.selected;
    })
    .each(function(d) {
        d.fixed=true;
    });
}

 function doClick(d){
     alert(d.name);
 }
 //circle边框颜色
 function nodeBorderColor(d){
     if(d.name=="上海"){
       return "#F79646";
   }else if(d.name=="杭州"){
        return "#FF0000";
   }else{
       return "#969696";
   }
 }
 //circle边框宽度
 function nodeBorderWidth(d){
     if(d.name=="青岛"){
       return "2px";
   }else if(d.name=="天津"){
        return "3px";
   }else{
       return "1px";
   }
 }
 //显示提示处理
function showtip(d){
    var x=d3.event.pageX;
    var y=d3.event.pageY;
       $("#tooltip").removeClass("hiddenele");
       $("#tooltip").css({
           left:x+"px",
           top:y+"px"
       });
    }
 //隐藏提示
    function hiddentip(d){
        $("#tooltip").addClass("hiddenele");
    }
//查询
 $("#searchBtn").click(function(){
     drawprofile();
     init();
 });

 function init(){
    //添加一个group,用于存放所有节点
    nodeg=graphcontainer.append("g").attr("id","nodeg");
    //添加一个group,用于存放所有line
    lineg=graphcontainer.append("g").attr("id","lineg");

     nodes = [ { name: "桂林" }, { name: "广州" },
                  { name: "厦门" }, { name: "杭州" },
                  { name: "上海" }, { name: "青岛" },
                  { name: "天津" } ];

     links = [ { source : 0 , target: 1 } , { source : 0 , target: 2 } ,
                   { source : 0 , target: 3 } , { source : 1 , target: 4 } ,
                   { source : 1 , target: 5 } , { source : 1 , target: 6 } ];

    force = d3.layout.force() //使用力导向图布局
     .friction(0.5) //速度随时间的损耗，默认0.9
       .nodes(nodes) //指定节点数组
       .links(links) //指定连线数组
       .size([width,height]) //指定作用域范围
       .linkDistance(150) //指定连线长度
       .charge([-400])//相互之间的作用力
       .chargeDistance(300)//设定引力的作用范围
       .gravity(0.1)
       //顶点数如果过多，计算的时间就会加大（O(n log n)）。theta 就是为了限制这个计算而存在的，默认值为0.8。
       //这个值越小，就能把计算限制得越紧。
       .theta(function(d){return 0.5;});
    force.start();//启用力导向图布局

     //在lineg里面添加连线
    svg_links = lineg.selectAll("line.link")
         .data(links)
         .enter()
         .append("line")
         .style("stroke","#ccc")
         .style("stroke-width",1);

    //每个节点有多个部分组成：外部圆(用于实现虚线边框)，内部圆，内部圆上的文字，把这3个放在一个g里面
    nodeitemg=nodeg.selectAll(".node")
            .data(nodes,function(currentNode,index){
                return currentNode.name;
            })  //nodeitemg.exit().remove();
            .enter()//nodeitemg.enter
            .append("g")
            .attr("class","node state")
            .attr("id",function(d){
                return Math.random();
            })
            .on("click",doClick)
          .on("mouseover",showtip)
          .on("mouseout",hiddentip);
    //添加外部圆
     nodeitemg.append("circle")
          .attr("r",function(d){
                 return 25;
              })
          .attr("class","outer");
    //添加内部圆节点
    nodeitemg.append("circle")
        .attr("r",20)
        .attr("class","inner")
        .style("stroke", nodeBorderColor) //可以定制不同的边框颜色
        .style("stroke-width",nodeBorderWidth);//可以返回不同的边框宽度


    //添加描述节点的文字
    nodeitemg.append("text")
        .style("fill", function(d){
            if(d.name=="上海"){
                return "#F79646";
            }else if(d.name=="杭州"){
                 return "#FF0000";
            }else{
                return "#969696";
            }
        })
        .attr("text-anchor","middle") //居中
          .attr("dominant-baseline","central") //居中
        .style("font-family","zdw_font") //设置字体，以便可以显示矢量图标
        .text(function(d){
            if(d.name=="桂林"){//图标
                return "\ue971";
            }else{
               return d.name;
            }
        });

        var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
        nodeitemg.call(node_drag);

        tick=function (){
            //更新连线坐标
            svg_links.attr("x1",function(d){return d.source.x; })
                .attr("y1",function(d){ return d.source.y; })
                .attr("x2",function(d){ return d.target.x; })
                .attr("y2",function(d){ return d.target.y; });

            nodeitemg.attr("transform",function(d){
                return "translate("+d.x+","+d.y+")";
            });
         }
        //在力布局完成之前自动触发，没次拖拽都会触发力布局，力布局的过程中每隔一小段时间间隔就会触发tick事件
        force.on("tick", tick);
 }

 //缩放和平移处理函数
 function zoomed(){
   graphcontainer.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
 }
 //给全局变量赋值
 function drawprofile(){
   xScale = d3.scale.linear().domain([0,width]).range([0,width]);
   yScale = d3.scale.linear().domain([0,height]).range([0, height]);
   body = d3.select("#graph-content").classed("svg-container", true);
   margin= {top: -5, right: -5, bottom: -5, left: -5};
 //zoom:缩放和平移,事件监听器都使用 "zoom"命名空间,移除缩放行为:selection.on(".zoom", null);
   zoom=d3.behavior.zoom().scaleExtent([0.1,1.5])//用于设置最小和最大的缩放比例
        .x(xScale).y(yScale).on("zoom",zoomed);
   //brush()：框选
   brusher = d3.svg.brush()
             //使用指定的比例尺构造一个刷子，如果不指定比例尺，将会是大小=0的刷子
             .x(xScale).y(yScale)
             .on("brushstart", function(d) {
               nodeitemg.each(function(d) {
                     d.selected = false;
                     d.previouslySelected = d.selected;
                });
             })
             .on("brush", function() {
                 var extent = d3.event.target.extent();
                 nodeitemg.classed("selected", function(d) {
                     return d.selected = d.previouslySelected ^
                     (extent[0][0] <= d.x && d.x < extent[1][0]
                      && extent[0][1] <= d.y && d.y < extent[1][1]);
                 });
             })
             .on("brushend", function() {
                 d3.event.target.clear();
                 d3.select(this).call(d3.event.target);
             });
     //添加一个g，用于存放整个图表
     graphcontainerwrap=body.each(function() { this.focus(); })
         .append("svg").attr("width",width).attr("height",height).append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
         .call(zoom);
    //加这个的目的是为了遮罩整个svg，在整体的角度响应zoom事件，不然只有鼠标在节点上时才能响应zoom事件
      rect = graphcontainerwrap.append("rect").attr("width", width)
                .attr("height", height).attr("class", "overlay").attr("id","graph-rect");
      brush = graphcontainerwrap.append("g")
         .datum(function() { return {selected: false, previouslySelected: false}; })
         .attr("class", "brush");
      //brusher创建后内部会有个class="background"的rect用于接受事件，这里控制鼠标光标的形状
      brush.select('.background').style('cursor', 'auto');
      //warp这个外层的g绑定缩放，修改内层graphcontainer的translate和scale才不闪烁
      graphcontainer=graphcontainerwrap.append("g") //再加个g，不然zoom平移的时候闪烁
        .attr("id","graphcontainer");
      //框选的时候
      function blockSelect(){
          graphcontainerwrap.call(zoom)
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);
           graphcontainerwrap.selectAll('g.gnode')
                        .on('mousedown.drag', null);
          brush.select('.background').style('cursor', 'crosshair');
           brush.call(brusher);
     }
      //缩放拖动的时候，默认
          function scaleDrag(){
          //给brush(g)绑定框选事件，共两种模式：框选和图像拖动，默认是图像拖动，去除掉框选的下面这
          //四个事件避免和zoom的冲突,默认是zoom事件(包括缩放和平移)，故这里去除掉brush的事件
            brush.call(brusher)
                  .on("mousedown.brush", null)
                  .on("touchstart.brush", null)
                  .on("touchmove.brush", null)
                  .on("touchend.brush", null);
                  brush.select('.background').style('cursor', 'auto');
                  graphcontainerwrap.call(zoom);
          }
          if(kxFlage){
              blockSelect();
          }else{
              scaleDrag();
          }
          $("#brushBtn").on("click",function(){
              kxFlage=!kxFlage;
              blockSelect();
          });
          $("#yd").on("click",function(){
              kxFlage=!kxFlage;
              scaleDrag();
          });
 }
</script>
