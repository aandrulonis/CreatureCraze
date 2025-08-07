function get_vertex_norms(triangles)
    
end

function write_stl_to_json(filename, diffuseCol, spectralCol, lightCol, lightPos)
    TR = stlread([filename '.stl']);
    arr = TR.Points(TR.ConnectivityList);
    arr_t = arr';
    arr = arr_t(:)';
    vertexCount = length(arr)/3;
    vertexCol
    str = jsonencode(struct('vertexCount',vertexCount,'vertexPositions',arr./(.5*max(arr))-1,'vertexColors',vertexColors,'vertexIndices',0:vertexCount-1),PrettyPrint=true);
    f = fopen([filename '.json'],'w');
    fprintf(f,'%s',str);
    fclose(f);
end

write_stl_to_json('bridge_tester');