function img = pixelate(pix_size, og_name)
    img = imread(og_name);
    [h, w, ~] = size(img);
    h_ind = (1:h)-mod(1:h,pix_size);
    h_ind(h_ind == 0) = 1;
    w_ind = (1:w)-mod(1:w,pix_size);
    w_ind(w_ind == 0) = 1;
    img = img(h_ind, w_ind,:);
end

function transparent(img, col, og_name)
    tol = 3;
    r_mask = abs(int32(img(:,:,1))-int32(col(1)))<=tol;
    g_mask = abs(int32(img(:,:,2))-int32(col(2)))<=tol;
    b_mask = abs(int32(img(:,:,3))-int32(col(3)))<=tol;
    mask = r_mask&g_mask&b_mask;
    imwrite(img,sprintf("%s_transparent.png",og_name),"Alpha",double(~mask));
end

function img = rotate(img, deg, back_col)
    [h,w,~] = size(img);
    diag = sqrt(h^2+w^2)/2;
    og_angle = (180/pi)*atan(h/w);
    h_new = 2*ceil(diag*abs(sind(deg+og_angle)))+1;
    w_new = 2*ceil(diag*abs(cosd(deg+og_angle)))+1;
    if (tand(deg)<0)
        h_new = h_new+2*w*ceil(abs(cosd(deg)));
    else
        w_new = w_new+2*w*ceil(abs(cosd(180-2*og_angle-deg)));
    end
    center_x = ceil(w_new/2);
    center_y = ceil(h_new/2);
    r=back_col(1).*uint8(ones(h_new,w_new));
    g=back_col(2).*uint8(ones(h_new,w_new));
    b=back_col(3).*uint8(ones(h_new,w_new));
    y_cent = (1:h)-ceil(h/2);
    x_cent = (1:w)-ceil(w/2);
    x_arr = ones(h,1)*x_cent;
    y_arr = y_cent' * ones(1,w);
    x_inds = round(cosd(deg).*x_arr-sind(deg).*y_arr);
    y_inds = round(sind(deg).*x_arr+cosd(deg).*y_arr);
    for i = 1:h
        for j = 1:w
            r(x_inds(i,j)+center_x,y_inds(i,j)+center_y)=img(i,j,1);
            g(x_inds(i,j)+center_x,y_inds(i,j)+center_y)=img(i,j,2);
            b(x_inds(i,j)+center_x,y_inds(i,j)+center_y)=img(i,j,3);
        end
    end
    img = cat(3,r,g,b);
end

function img = wash(img,col_avg,lighten)
    weights=lighten.*double(col_avg)./norm(double(col_avg));
    norms=sqrt(double(img(:,:,1)).^2+double(img(:,:,2)).^2+double(img(:,:,3)).^2);
    r=floor(weights(1).*norms);
    r(r>255)=255;
    g=floor(weights(2).*norms);
    g(g>255)=255;
    b=floor(weights(3).*norms);
    b(b>255)=255;
    img=cat(3,uint8(r),uint8(g),uint8(b));
end

% img=pixelate(15, "monkey.png");
% img=rotate(img,40,[0,0,0]);
img=imread('./arcade/images/space_invaders/monkey_transparent.png');
img=wash(img,uint8([52, 229, 235]),1.5);
transparent(img,img(1,1,:),"monkey_dying");
