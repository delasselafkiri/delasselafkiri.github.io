var width2 = 700,
    height2 = 600,
    innerRadius = 180,
    outerRadius = 700 / 2.5;

var svg2 = d3.select("#dataviz")
    .append("svg").attr("width", width2)
    .attr("height", height2)
g = svg2.append("g").attr("transform", "translate(" + width2 / 2 + "," + height2 / 2 + ")");

var xScaleOffset = Math.PI * 5 / 180;
var x = d3.scaleBand()
    .range([xScaleOffset, 2 * Math.PI + xScaleOffset])
    .align(0);

var y = d3.scaleLinear()
    .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
    .range(["#e31a1c", "#fd8d3c", '#fecc5c', '#ffffb2']);

var zClasses = ['Vulnérabilité élevée', 'Vulnérabilité moyenne', 'Vulnérabilité faible', 'Vulnérabilité nulle'];

d3.csv("https://gist.githubusercontent.com/CDelasse/0f2ab93d756cbe5afa9af4de063ffd71/raw/cbe6ef69bbe335f0dc5cc1976c2a530e304352ad/sec.csv", function (d, i, columns) {
    d.elv = (+d.elv);
    d.moy = (+d.moy);
    d.fbl = (+d.fbl);
    d.nul = (+d.nul);
    return d;
}, function (error, data) {
    if (error) throw error;

    var keys = data.columns.slice(1);
    var meanAccidents = d3.mean(data, function (d) { return d3.sum(keys, function (key) { return d[key]; }); })

    x.domain(data.map(function (d) { return d.label; }));
    y.domain([0, d3.max(data, function (d) { return (d.elv + d.moy + d.fbl + d.nul); })]);
    z.domain(data.columns.slice(1));

    // Accidents
    g.append('g')
        .selectAll("g")
        .data(d3.stack().keys(data.columns.slice(1))(data))
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .selectAll("path")
        .data(function (d) { return d; })
        .enter().append("path")
        .attr("d", d3.arc()
            .innerRadius(function (d) { return y(d[0]); })
            .outerRadius(function (d) { return y(d[1]); })
            .startAngle(function (d) { return x(d.data.label); })
            .endAngle(function (d) { return x(d.data.label) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius));

    //yAxis and Mean

    var yAxis = g.append("g")
        .attr("text-anchor", "middle");

    var yTicksValues = d3.ticks(0, 100, 4);

    //console.log('Среднее: ', meanAccidents);

    // Mean value line
    //var yMeanTick = yAxis
    //.append("g")
    //.datum([meanAccidents]);

    //yMeanTick.append("circle")
    //.attr("fill", "none")
    //.attr("stroke", "#C0625E")
    //.attr("stroke-dasharray", "5 3")
    //.attr("r", y);

    var yTick = yAxis
        .selectAll("g")
        .data(yTicksValues)
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "#ccdcea")
        .attr("r", y);

    yTick.append("text")
        .attr("y", function (d) { return -y(d); })
        .attr("dy", "0.35em")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .text(y.tickFormat(5, "s"));

    yTick.append("text")
        .attr("y", function (d) { return -y(d); })
        .attr("dy", "0.35em")
        .text(y.tickFormat(5, "s"));

    yAxis.append("text")
        .attr("y", function (d) { return -y(yTicksValues.pop()); })
        .attr("dy", "-2em")
        .text("Sensibilité à la sécheresse dans la région de l'Afrique du Nord");

    // Labels for xAxis

    var label = g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) { return "rotate(" + ((x(d.label) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

    /*  label.append("line")
          .attr("x2", function(d) { return (((d.label % 5) == 0) | (d.label == '1')) ? -7 : -4 })
          .attr("stroke", "#000");*/

    label.append("text")
        .attr("transform", function (d) { return (x(d.km) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .text(function (d) {
            var xlabel = d.label;
            return xlabel;
        });

    // Legend
    var legend = g.append("g")
        .selectAll("g")
        .data(zClasses)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(-50," + (i - (zClasses.length - 1) / 2) * 25 + ")"; });

    legend.append("circle")
        .attr("r", 8)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .text(function (d) { return d; });

});