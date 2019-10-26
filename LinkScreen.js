import React from 'react';
import {View,StyleSheet,Text,Button as Bouton,ListView,TouchableHighlight,Modal,Dimensions,ScrollView,ToastAndroid} from 'react-native'
import {Body, Container, Header, Icon, Left, Right,Footer,FooterTab,H1,CheckBox,Item,Label,Form,Input,Content,List,ListItem,Button,Toast} from "native-base";
import { Dialog } from "react-native-simple-dialogs";
import MenuButton from "../Components/MenuButton";
import { Ionicons } from '@expo/vector-icons'
import * as firebase from 'firebase'
import moment from 'moment'
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen'

const firebaseConfig = {
    apiKey: "AIzaSyCe8KQZdgS2B8jF_gq5Qhes7upBzCytbXQ",
    authDomain: "shoplist-b34e4.firebaseapp.com",
    databaseURL: "https://shoplist-b34e4.firebaseio.com",
    projectId: "shoplist-b34e4",
    storageBucket: "",
    messagingSenderId: "736067404953",
    appId: "1:736067404953:web:d28c29f589064a16"
}

var currentDate = moment().format("DD|MM|YYYY");

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default class LinkScreen extends React.Component {

    static navigationOptions ={
        header: null
    }

    constructor(){
        super();

        let ds = new ListView.DataSource({rowHasChanged:(r1,r2) => r1 !== r2});

        this.state = {
            text: '',
            quantite: '',
            item_temp: [],
            textUpdate: '',
            quantiteUpdate: '',
            checkbox:false,
            itemDataSource: ds,
            modalVisible: false,
            visible: false,
        };

        List.today= currentDate;

        this.itemsRef = this.getRef().child('lists/items');
        this.renderRow = this.renderRow.bind(this);
        this.pressRow = this.pressRow.bind(this);
        this.isChecked = this.isChecked.bind(this);
        this.updateItem = this.updateItem.bind(this);

    }
    openDialog = (show) => {
        this.setState({ showDialog: show });
    };

    setModalVisible(visible){
        this.setState({modalVisible: visible});
    };

    getRef(){
        return firebaseApp.database().ref();
    };

    componentWillMount() {
        this.getItems(this.itemsRef)
    };

    componentDidMount() {
        //this.getItems(this.itemsRef)
    }

    getItems(itemsRef){
        const dateList = this.props.navigation.getParam('dateList');
        const dateListStr = JSON.stringify(dateList);
        //let items = [{title:"Lait"},{title:"Oeuf"}];
        itemsRef.orderByChild('today').equalTo(currentDate).on('value', (snap) => {
            let items = [];
            snap.forEach((child) => {
                items.push({
                    title: child.val().title,
                    quantite: child.val().quantite,
                    etat: child.val().etat,
                    today: child.val().today,
                    _key: child.key,
                });
            });
            this.setState({
                itemDataSource: this.state.itemDataSource.cloneWithRows(items)
            });
        });
    }

    addItem(){
        this.setModalVisible(true) //Affichage_modal
    }

    pressRow(item){
        this.itemsRef.child(item._key).remove(); //Suppression
    }

    updateItem(item)
    {
        this.itemsRef.child(item._key).update({title:this.state.textUpdate,quantite:this.state.quantiteUpdate});
    }

    isChecked(item)
    {
        this.setState({checkbox:!this.state.checkbox});
        this.itemsRef.child(item._key).update({etat:!this.state.checkbox})
    }

    renderRow(item){
        {
            return(
                <TouchableHighlight onPress={() => {}}>

                    <ListItem icon
                              renderSeparator={(sectionId,rowId) => <View key={rowId} style={{borderBottomWidth:0.8,borderBottomColor:'black'}}/>}
                    >
                        <Left>
                            <Button bordered dark>
                                <Text>{item.quantite}</Text>
                            </Button>
                        </Left>
                        <Body>
                            <Text>{item.title}</Text>
                        </Body>
                        <Right>
                            <Ionicons
                                name="ios-create"
                                size={30}
                                color="grey"
                                onPress={()=>{
                                    this.openDialog(true); this.setState({item_temp: item,textUpdate:item.title,quantiteUpdate:item.quantite})}}
                            />
                            <CheckBox checked={item.etat} color="green" style={{marginRight:20}} onPress={() => {
                                    this.isChecked(item)
                               }}
                            />
                            <Ionicons
                                name="ios-close-circle-outline"
                                size={32}
                                color="red"
                                onPress={()=>{this.pressRow(item)}}
                            />
                        </Right>
                    </ListItem>

                </TouchableHighlight>

            )
        }
    }


    render() {
        return (
            <Container>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {}}
                    style={{justifyContent:'center',width:wp('80%'),height:hp('50%')}}
                >

                    <View style={{marginTop:-20}}>
                        <View>
                            <Header style={{backgroundColor:'#3a455c', height: 80 ,borderBottomColor:'#757575'}}>

                                <Body>
                                    <Text style={{color:'white', fontSize: 20,fontStyle:'italic',marginTop: 20}}>ShopList</Text>
                                </Body>

                            </Header>
                            <H1 style={{textAlign:'center',marginTop:16}}>Ajouter un produit</H1>
                            <Form>
                                <Item floatingLabel>
                                    <Label>Nom du produit</Label>
                                    <Input
                                        value={this.state.text}
                                        onChangeText={(value) => this.setState({text:value})}
                                    />
                                </Item>
                                <Item floatingLabel>
                                    <Label>Quantité du produit</Label>
                                    <Input
                                        value={this.state.qte}
                                        onChangeText={(value) => this.setState({qte:value})}
                                    />
                                </Item>
                            </Form>
                            <View style={{flexDirection:'row',marginTop:20,width:wp('100%')}}>
                                <TouchableHighlight style={{width:wp('50%')}}
                                                    onPress={() => {
                                                        this.setModalVisible(!this.state.modalVisible);
                                                    }}>
                                    <Text style={{fontSize:20,textAlign:'center',borderRightColor:'black',borderRightWidth:0.5}}>Cancel</Text>
                                </TouchableHighlight>
                                <TouchableHighlight style={{width:wp('50%')}}
                                                    onPress={() => {
                                                        if (this.state.text === "" || this.state.qte === "")
                                                        {
                                                                ToastAndroid.show("Please fill all the fields",ToastAndroid.SHORT)
                                                        }
                                                        else if (!isNaN(this.state.text ))
                                                        {
                                                                ToastAndroid.show("Please, enter a valid product name!",ToastAndroid.SHORT)
                                                        }
                                                        else if (isNaN(this.state.qte))
                                                        {
                                                            ToastAndroid.show("Please, enter a valid product quantity!",ToastAndroid.SHORT)
                                                        }
                                                        else
                                                        {
                                                            this.itemsRef.push({
                                                                title:this.state.text,
                                                                quantite:this.state.qte,
                                                                today:currentDate,
                                                                etat:false,});
                                                            this.setModalVisible(!this.state.modalVisible);
                                                            this.setState({text:"",qte:""})
                                                        }
                                                    }}>
                                    <Text style={{fontSize:20,textAlign:'center'}}>Ajouter</Text>
                                </TouchableHighlight>

                            </View>
                        </View>
                    </View>
                </Modal>


                <Header style={{backgroundColor:'#3a455c', height: 80 ,borderBottomColor:'#757575'}}>
                    <Left style={{marginTop: 20}}>
                        <MenuButton navigation={this.props.navigation}/>
                    </Left>
                    <Body>
                        <Text style={{color:'white', fontSize: 20,fontStyle:'italic',marginTop: 20}}>ShopList</Text>
                    </Body>
                    <Right style={{marginTop: 20}}>
                        <Ionicons
                            name="md-add-circle-outline"
                            color="#fff"
                            size={36}
                            style={{zIndex: 9}}
                            onPress={this.addItem.bind(this)}
                        />
                    </Right>
                </Header>
                <View>
                    <View style={{borderBottomWidth:0.5,borderBottomColor:'black',height: 50,paddingTop:10,flexDirection:'row'}}>
                        <Text style={{fontSize: 20,fontstyle:'italic',fontweight:'bold',textAlign: 'left',marginLeft:5}}>Votre liste</Text>
                        <Text style={{fontSize: 20,fontstyle:'italic',fontweight:'bold',textAlign: 'right',flex:1,justifyContent: 'flex-end'}}> {currentDate}</Text>
                    </View>
                    <ScrollView>
                        <View>
                            <ListView
                                dataSource={this.state.itemDataSource}
                                renderRow={this.renderRow}
                                style={{marginTop:20}}
                            />
                        </View>
                    </ScrollView>
                </View>

                <Dialog
                    title="Modifier un produit"
                    animationType="fade"
                    contentStyle={
                        {
                            alignItems: "center",
                            justifyContent: "center",
                        }
                    }
                    onTouchOutside={ () => this.openDialog(false) }
                    visible={ this.state.showDialog }
                    >
                    <View style={{height:hp('40')}}>
                        <View>
                            <Form>
                                <Item floatingLabel>
                                    <Label>Nom du produit</Label>
                                    <Input
                                        value={this.state.textUpdate}
                                        onChangeText={(value) => this.setState({textUpdate:value})}
                                    />
                                </Item>
                                {/*<Item floatingLabel>
                                    <Label>Nom du produit</Label>
                                    <Input
                                        value={this.state.textUpdate}
                                        onChangeText={(value) => this.setState({textUpdate:value})}
                                    />
                                </Item>*/}
                                <Item floatingLabel>
                                    <Label>Quantité du produit</Label>
                                    <Input
                                        value={this.state.quantiteUpdate}
                                        onChangeText={(value) => this.setState({quantiteUpdate:value})}
                                    />
                                </Item>
                                <Item>
                                    <View style={{flexDirection:'row',marginVertical:30}}>
                                        <View style={{width:wp('40%')}}>
                                            <Bouton
                                                onPress={ () => this.openDialog(false) }
                                                style={ { marginTop: 10 } }
                                                title="Cancel"
                                                color="grey"
                                            />
                                        </View>
                                        <View style={{width:wp('40%')}}>
                                            <Bouton onPress={()=>{
                                                if (this.state.textUpdate === "" || this.state.quantiteUpdate === "")
                                                {
                                                    ToastAndroid.show("Please fill all the fields",ToastAndroid.SHORT)
                                                }
                                                else if (!isNaN(this.state.textUpdate ))
                                                {
                                                    ToastAndroid.show("Please, enter a valid product name!",ToastAndroid.SHORT)
                                                }
                                                else if (isNaN(this.state.quantiteUpdate))
                                                {
                                                    ToastAndroid.show("Please, enter a valid product quantity!",ToastAndroid.SHORT)
                                                }
                                                else
                                                    {
                                                    this.updateItem(this.state.item_temp);
                                                    this.openDialog(false);
                                                    this.setState({textUpdate:"",quantiteUpdate:""})
                                                    }
                                                }
                                                }
                                                    title='Modifier'/>
                                        </View>
                                    </View>
                                </Item>
                            </Form>
                        </View>

                    </View>

                </Dialog>

            </Container>

        );
    }
}

const styles = StyleSheet.create({
    container :
        {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
        },
    textHome:
        {
            fontSize:30,
            marginTop: 20
        }
})