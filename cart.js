const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'zhang-hexschool';

//veevalidate 加入全部規則。defineRule 是定義規則
Object.keys(VeeValidateRules).forEach((rule) => {
  VeeValidate.defineRule(rule, VeeValidateRules[rule]);
});

// 定義規則時會使用的 rules
VeeValidate.defineRule('required', required); // ('自己命名的')
VeeValidate.defineRule('email', email);
VeeValidate.defineRule('min', min); // 8-10碼
VeeValidate.defineRule('max', max);

VeeValidateI18n.loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json'); // 宣告

VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'), // 使用  設定語系 // 多國語系
});

const app = Vue.createApp({
  data() {
    return {
      cartData: {}, // 購物車列表
      products: [], // 產品列表
      productId: '', // 1.前內後外，外層使用
      isLoadingItem: '',
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
    };
  },
  methods: {
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`)
        .then((res) => {
          console.log(res);
          this.products = res.data.products;
        });
    },
    openProductModal(id) { // 0.帶入特定品項 id
      this.productId = id; // 2.外層接
      this.$refs.productModal.openModal(); // 取得元件下的方法
    },
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          console.log(res);
          this.cartData = res.data.data; // 購物車內容data-> data -> carts(已加入購物車的內容)->total
        });
    },
    addToCart(id, qty = 1) { // 參數預設值
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id; // 觸發時將 Id存取
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then((res) => {
          console.log(res);
          // this.cartData = res.data.data; // 購物車內容data-> data -> carts(已加入購物車的內容)->total
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = '';
        });
    },
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
        .then((res) => {
          console.log(res);
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    // 刪除全部購物車
    removeAllCart() {
      axios.delete(`${apiUrl}/api/${apiPath}/carts`)
        .then(() => {
          this.getCart();
        });
    },
    updateCartItem(item) { // 參數預設值
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id; // 觸發時將 Id存取
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          console.log(res);
          // this.cartData = res.data.data; // 購物車內容data-> data -> carts(已加入購物車的內容)->total
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    createOrder() {
      const order = this.form;
      const url = `${apiUrl}/api/${apiPath}/order`;
      axios.post(url, { data: order })
        .then((res) => {
          alert(res.data.message);
          this.$refs.form.resetForm();// 清空表單
          this.getCart();
        });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart(); // 初始化過程中就須取得
  },
});

// $refs，須將product-modal掛置畫面上
app.component('product-modal', {
  props: ['id'], // 3.使用props接收
  template: '#userProductModal',
  data() {
    return {
      modal: {}, // 定義一個變數讓底下的 modal 作用域一樣
      product: {},
      qty: 1, // 預設至少一個
    };
  },
  watch: {
    id() {
      this.getProduct(); // 當 id 有變動時，我就觸發 getProduct 方法
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          console.log(res);
          this.product = res.data.product;
        });
    }, // 取得遠端資料
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty);
    },
  },
  mounted() {
    // ref="modal"
    this.modal = new bootstrap.Modal(this.$refs.modal); // 最上方設定全域變數
  },
});
// vee-validate 表單驗證元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');
