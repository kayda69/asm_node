var express = require('express');
var router = express.Router();
const multer = require ('multer')
const mongoose = require('mongoose')
main().catch(err => console.log(err));

async function main() {
  // tai khaoan : mat khau
  // Products la ten cua database
  const db = 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/Products'
  await mongoose.connect(db);
}

const CarModel
    = new mongoose.Schema({
  maXe : String,
  tenXe: String,
  giaTien : String,
  namSX : String,
  hinhAnh : [{ type: String }]

})
/* GET home page. */
router.get('/',async function(req, res, next) {
  const query = mongoose.model('Car', CarModel, 'Car')
  // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
  const data = await query.find()
  res.render('index', { title: 'Offical Ferrari Website', data : data, path: '/uploads/' });
});

router.get('/duLieu',async function(req,res){
  const query = mongoose.model('Car', CarModel, 'Car')
  // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
  const data = await query.find()
  res.status(200).json({
    data: data
  });
})

const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Duong dan luu tru file
  },
  // Tu dong dat ten anh la thoi gian hien tai + 1 so random
  filename: function (req, file, cb) {

    cb(null,file.originalname);
  }
});
const upload = multer({
  storage: storage,
});



// So anh toi da mot lan load la 5 anh
const maxFileCount = 5;
router.post('/addCar', (req, res, next) => {
  upload.array('images', maxFileCount)(req, res, async function (err) {
    // Các xử lý lỗi như ở ví dụ trước

    // Kiểm tra xem có file nào được upload hay không
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('Vui lòng chọn ít nhất một tập tin');
    }

    const maXe = req.body.maXe;
    const tenXe = req.body.tenXe;
    const giaTien = req.body.giaTien;
    const namSX = req.body.namSX;

    const hinhAnh = req.files.map(file =>'uploads/' + file.originalname);
    console.log(hinhAnh)
    // Lấy đường dẫn ảnh từ các files upload và tạo mảng đường dẫn hình ảnh

    const query = mongoose.model('Car', CarModel, 'Car');
    await query.create({
      maXe: maXe,
      tenXe: tenXe,
      giaTien: giaTien,
      namSX: namSX,
      hinhAnh: hinhAnh, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
    });

    res.redirect('/');
  });
});

router.get('/delete', async function (req,res){
  const maXe = req.query.maXe
  const query = mongoose.model('Car', CarModel, 'Car');
  await query.deleteOne({maXe:maXe})
  // Cap nhat lai danh sach sau khi xoa
  const data = await query.find()
  res.redirect('/');
  res.render('index', { title: 'Offical Ferrari Website', data : data, path: '/uploads/' });

})

router.delete('/deleteInApp', async (req, res) => {
  const query = mongoose.model('Car', CarModel, 'Car');
  try {
    const maXe = req.query.maXe; // Lấy giá trị maXe từ query parameter
    const deletedItem = await query.findOneAndRemove({ maXe: maXe }); // Tìm và xóa item có maXe tương ứng
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', item: deletedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.post('/updateCar',async function (req,res){
  upload.array('imagesUpdate', maxFileCount)(req, res, async function (err) {
    // Các xử lý lỗi như ở ví dụ trước

    // Kiểm tra xem có file nào được upload hay không
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('Vui lòng chọn ít nhất một tập tin');
    }

    const maXe = req.body.maXe;
    const tenXe = req.body.tenXe;
    const giaTien = req.body.giaTien;
    const namSX = req.body.namSX;
    const hinhAnh = req.files.map(file =>'uploads/' +  file.originalname);
    // Lấy đường dẫn ảnh từ các files upload và tạo mảng đường dẫn hình ảnh

    const query = mongoose.model('Car', CarModel, 'Car');
    await query.updateOne({maXe : maXe},{
      tenXe: tenXe,
      giaTien: giaTien,
      namSX: namSX,
      hinhAnh: hinhAnh, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
    })
    res.redirect('/');
  });
})

// Router của ứng dụng Node.js
router.post('/updateInApp', upload.single('imagesUpdate'), async (req, res) => {
  try {
    const maXe = req.body.maXe; // Lấy mã xe từ body của yêu cầu POST
    const tenXe = req.body.tenXe;
    const giaTien = req.body.giaTien;
    const namSX = req.body.namSX;
    const hinhAnh = req.file.path; // Lấy danh sách tên hình ảnh từ các files upload

    const query = mongoose.model('Car', CarModel, 'Car');
    const updatedItem = await query.findOneAndUpdate(
        { maXe: maXe }, // Tìm sản phẩm có mã xe tương ứng
        { tenXe: tenXe, giaTien: giaTien, namSX: namSX, hinhAnh: hinhAnh }, // Cập nhật thông tin sản phẩm và danh sách hình ảnh
        { new: true } // Trả về sản phẩm sau khi đã cập nhật
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.post('/addInApp', upload.single('images'), async (req, res) => {
  const { maXe, tenXe, giaTien, namSX } = req.body;

  if (!maXe || !tenXe || !giaTien || !namSX) {
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
  }

  const query = mongoose.model('Car', CarModel, 'Car');

  try {
    const newCar = await query.create({
      maXe: maXe,
      tenXe: tenXe,
      giaTien: giaTien,
      namSX: namSX,
      hinhAnh: req.file.path, // Lưu đường dẫn tạm thời của tệp tin đã tải lên
    });

    res.status(201).json({ message: 'Thêm sản phẩm thành công', newItem: newCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
module.exports = router;
