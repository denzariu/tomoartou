import { ActivityIndicator, Animated, Dimensions, FlatList, Image, NativeScrollEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { TextInput } from 'react-native';
import { Modalize } from 'react-native-modalize';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SearchScreen = () => {
  
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string | undefined>('');

  const [artworksData, setArtworksData] = useState<any | undefined>([])
  const [artworks, setArtworks] = useState<any | undefined>([])

  const [currentItem, setCurrentItem] = useState<any>()
  const modalizeRef = useRef<Modalize>(null);

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';
  const larger_size_url = '/full/843,/0/default.jpg';
  // const [imageUrl, setImageUrl] = useState<string>('/full/843,/0/default.jpg');
  const [artworkImageLink, setArtworkImageLink] = useState<any>([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}, {uri: (iiif_url + currentItem?.image_id + larger_size_url), width: 200, height: 200}])
  const [isEnlarged, setEnlarged] = useState<boolean>(false)

  const LIMIT = 16;
  const OFFSET = 68;
  const BOTTOM_TAB_OFFSET = 52 //useBottomTabBarHeight()
  const windowHeight = Dimensions.get('window').height;


  const getArtworks = () => {
    // console.log('d:', artworksData)
    
    //   artworksData.reduce(async (accPromiseFromLastIter: any, next: any) => {
    //     const arr = await accPromiseFromLastIter;
    //     arr.push(await next.json().data);
    //     return arr;
    //   }, Promise.resolve([])
    // )
  
    // const artworksCopy: Array<any> = artworksData.reduce(async (result: Array<any>, item: any) => {
        
        // console.log(item.api_link + '?fields=id,title,image_id')

      
      //   const arr = await result;
      //   await fetch(item.api_link + '?fields=id,title,image_id')
      //   .then(response => response.json())
      //   .then(json => {
          
      //   })
      //   .catch(error => {console.log('FETCHING ARTWORKS ONE-BY-ONE FAILED.', error)})
      // }
      // console.log(artworksCopy)
  
      // return Promise.all(queries.map(q => q.then(res => res.json()))
      // .then(data => {

      // }) 
      
      setFetching(true);
      // do fetch requests in parallel
      // using the Promise.all() method
      const promises = artworksData.map((item: any) => {
        return fetch(`${item.api_link}?limit=${LIMIT}&fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title`)
        .then(response => response.json())
        .then(json => {
          if (json.data.description)
            json.data.description = json.data.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
          return json.data
        })
        .catch(error => {console.log('FETCHING ARTWORKS ONE-BY-ONE FAILED.', error)})
      })
      const allData = Promise.all(promises);

      allData.then((res) => {
        // artworksCopy.concat(res)
        setFetching(false);
        setArtworks(res)
        console.log(artworks)
      })
  }
  

  useEffect(() => {
    getArtworks()  
  }, [artworksData])

  const searchArtworks = async () => {

    if (searchInput) {
      setLoading(true);
      //https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=2&fields=id,title,image_id
      const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchInput)}`
      console.log(url)

      return (
        setFetching(true),
        await fetch(url)
        .then(response => response.json())
        .then(json => {
          // setArtworks(artworks.concat(json.data))
          
          // setArtworksData(artworks.concat(json.data))
          
          setArtworksData(json.data)
          console.log(json.data.length)
          // if(json && json.data && json.data.length)
          setLoading(false)
          setFetching(false)
        })
        .catch(error => {
          console.log('FETCHING ARTWORKS FAILED.', error)
        }) 
      )
    }
  }

  useEffect(() => {
    console.log("hello")
    searchArtworks();
  }, [searchInput])
  

  

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = 260; // Proximity to bottom, triggering event
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  const handleText = (text: string) => { 
    setSearchInput(text); 
  } 

  
  const SearchHeader = () => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          // autoFocus={true}
          style={styles.inputContainer}
          textAlign='center'
          textAlignVertical='center'
          placeholder='Search for artworks or artists...'
          inputMode='text'
          maxLength={100}
          selectTextOnFocus={true}
          placeholderTextColor={currentTheme.colors.primary}
          defaultValue={searchInput}
          onSubmitEditing={(text) => handleText(text.nativeEvent.text)}
        >
        </TextInput>
      </View>
    )
  }

  const handleArtworkOpenPress = (item: any) => {
    console.log(item.id)
    setCurrentItem(item)
    setArtworkImageLink([{uri: (iiif_url + item?.image_id + size_url), width: 100, height: 100}, {uri: (iiif_url + item?.image_id + larger_size_url), width: 200, height: 200}])
    modalizeRef.current?.open()
  }

  const handleArtworkClosePress = (item: any) => {
    console.log(item.id)
    modalizeRef.current?.open()
  }

  const renderContent = () => [
    <View key="0">
      {/* Header section - (with a close button) */}
      {/* <View style={styles.modalHeader}> */}
        {/* <TouchableOpacity onPress={handleArtworkClosePress}> */}
        {/* <MaterialCommunityIcons name="close-circle" color={currentTheme.colors.foreground} size={24} /> */}
         {/* <SvgXml xml={svgClose} height={24} width={24}
             fill={colors.quaternary}
           /> */}
         {/* </TouchableOpacity> */}
      {/* </View> */}
      <View style={styles.modalHeader}>
        <View style={styles.modalButton}>
          <TouchableOpacity 
            onPress={() => {setEnlarged(!isEnlarged), console.log(isEnlarged)}}
            style={styles.modalImageEnlarge}
          >
            {isEnlarged ?
              <MaterialCommunityIcons name="focus-field-horizontal" color={currentTheme.colors.foreground} size={26} />
              :
              <MaterialCommunityIcons name="image-size-select-large" color={currentTheme.colors.foreground} size={26} />
            }
          </TouchableOpacity>
        </View>
        <View style={styles.modalSection}>
          <Animated.Image
            // src={(iiif_url + currentItem?.image_id + larger_size_url)}
            source={artworkImageLink}
            onError={() => setArtworkImageLink([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}])}
            // srcSet= { `${iiif_url + currentItem?.image_id + size_url} 1x, ${iiif_url + currentItem?.image_id + larger_size_url} 2.215x`}
            // onLoadStart={}
            // defaultSource={{uri: (iiif_url + currentItem?.image_id + size_url)}}
            style={[{width: '100%', alignSelf: 'center'}, isEnlarged ? {} : {maxHeight: windowHeight * 0.77}, currentItem?.thumbnail ? {aspectRatio: currentItem.thumbnail.width / currentItem.thumbnail.height} : {}]}
          />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.modalTitle}>{currentItem?.title.toUpperCase()}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.modalDetails}>{currentItem?.classification_title}  ●  {currentItem?.dimensions_detail[0]?.width_cm} cm × {currentItem?.dimensions_detail[0]?.height_cm} cm</Text>  
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.modalAuthor}>{currentItem?.artist_title? currentItem.artist_title : "Not specified"}</Text>
            <Text style={styles.modalCirca}>{currentItem?.date_display}</Text>
          </View>
          <Text style={styles.modalDescriptionFirst}>{currentItem?.description ? currentItem.description[0] : ''}
            <Text style={styles.modalDescription}>{currentItem?.description?.slice(1)}</Text>
          </Text>

        </View>
      </View>
    {/* //   Section with Information 
    //   <View style={styles.modalHeader}>
    //     <View style={styles.modalSection}>
    //       <Animated.Image
    //         source={{uri: foodItem.image}}
    //         style={[styles.modalImage, styles.coverPhoto]}
    //       />
    //       <Text style={styles.modalTitle}>{foodItem.name}</Text>
    //       <Text style={styles.modalPrice}>{Intl.NumberFormat('ro-RO', {minimumFractionDigits: 2, style: 'currency', currency: 'lei', currencyDisplay: 'name'}).format(foodItem.price / 100).toLowerCase()}</Text>
    //       <Text style={styles.modalDescription}>{foodItem.description}</Text>
    //     </View>
    //       {/* <View style={styles.modalDivider} />   
    //   </View>
    // </View>,
  
    // <View key="1">
    //   <View style={styles.modalInfo}>
    //     <View style={[styles.modalSection, {marginBottom: '15%'}]}>
    //       <Text style={styles.modalNote}>Leave a note for the kitchen</Text>
    //     </View>
    //   </View> }
    */}
    </View>
  ]

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.page
    },

    pageContainer: {
      width: '100%',
      paddingHorizontal: currentTheme.spacing.page
    },
    
    artworkTouchable: {
      
    },

    image: {
       
    },

    text: {
      color: currentTheme.colors.foreground
    },

    loadingView: {

      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      justifyContent: 'center', 
      alignItems: 'center',
    },

    loadingIndicator: {
      padding: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 32
    },

    wrapper: {
      flex: 1
    },
    container: {
        flexDirection: 'row',
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 10,
    },

    searchContainer: {
      width: '100%',
      height: 60,
      paddingVertical: 8,
      backgroundColor: currentTheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    },

    inputContainer: {
      // alignSelf: 'center',
      // paddingVertical: 12,
      backgroundColor: currentTheme.colors.foreground,
      width: '100%',
      color: currentTheme.colors.primary,
      fontWeight: 'bold',
      borderRadius: currentTheme.spacing.s
    },

    modalHeader: {
      width: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderTopLeftRadius: currentTheme.spacing.m,
      borderTopRightRadius: currentTheme.spacing.m,
    },
    
    modalSection: {
      backgroundColor: currentTheme.colors.background,
      // borderRadius: 12,
      color: currentTheme.colors.primary,
      fontSize: currentTheme.fontSize.xl,
      fontWeight: 'bold',
      marginBottom: currentTheme.spacing.s,
    },

    modalTitle: {
      fontFamily: currentTheme.fontFamily.butler,
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.xl,
      fontWeight: 'bold',
      paddingTop: currentTheme.spacing.m,
      paddingHorizontal: currentTheme.spacing.page
    },

    modalAuthor: {
      alignSelf: 'flex-start',
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.m,
      fontWeight: 'bold',
      paddingVertical: currentTheme.spacing.s,
      marginHorizontal: currentTheme.spacing.page,
      paddingHorizontal: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: currentTheme.spacing.m,
      width: 'auto'
    },
    
    modalDetails: {
      color: currentTheme.colors.primary,
      fontSize: currentTheme.fontSize.s,
      fontWeight: '300',
      paddingBottom: currentTheme.spacing.m,
      marginHorizontal: currentTheme.spacing.page,
    },

    modalCirca: {
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.s,
      fontWeight: '400',
      paddingVertical: currentTheme.spacing.s,
      // marginHorizontal: currentTheme.spacing.page,
      // paddingHorizontal: currentTheme.spacing.m,
      // backgroundColor: currentTheme.colors.primary,
      // borderRadius: currentTheme.spacing.m,
      // width: 'auto'
    },

    modalImageEnlarge: {
      zIndex: 201,
      padding: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: currentTheme.spacing.m
    },
    
    modalButton: {
      position: 'absolute',
      // bottom:0,
      top: currentTheme.spacing.m, 
      right: currentTheme.spacing.page, 
      // padding: 8, 
      // backgroundColor: 'red', 
      zIndex: 200
    },

    modalDescription: {
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.s,
      lineHeight: 20,
      textAlign: 'justify',
      fontWeight: '300',
      paddingTop: currentTheme.spacing.m,
      marginHorizontal: currentTheme.spacing.page,
    },

    modalDescriptionFirst: {
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.xxl,
      lineHeight: 20,
      textAlign: 'justify',
      fontWeight: '300',
      paddingTop: currentTheme.spacing.l,
      marginHorizontal: currentTheme.spacing.page,
    }

  })

  return (
    // <SafeAreaView style={styles.page}>
      <SafeAreaView style={styles.pageContainer}>
        <SearchHeader/>
        
        <ScrollView 
          
          // stickyHeaderIndices={[0]}
          // stickyHeaderHiddenOnScroll={false}
          removeClippedSubviews={true}
          contentContainerStyle={styles.container}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={400}
          style={{marginBottom: BOTTOM_TAB_OFFSET}}
        >
          <FlatList
            keyExtractor={(item, index) => 1  + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              (index % 2 == 0 && item && (item.image_id && item.thumbnail && item.thumbnail.height > 0)) ?
              <TouchableOpacity 
                style={styles.artworkTouchable} 
                onPress={() => {handleArtworkOpenPress(item)}}
                activeOpacity={0.9}
              >
                <Image 
                  source={{uri: (iiif_url + item.image_id + size_url)}} style={[{width: '100%'}, item.thumbnail ? {aspectRatio: item.thumbnail.width / item.thumbnail.height} : {}]} 
                /> 
              </TouchableOpacity>:<></>            
            )}
          />
          <FlatList
            removeClippedSubviews={true}
            keyExtractor={(item, index) => 2 + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              (index % 2 == 1 && item && (item.image_id && item.thumbnail && item.thumbnail.height > 0)) ?
              <TouchableOpacity 
                style={styles.artworkTouchable} 
                onPress={() => {handleArtworkOpenPress(item)}}
                activeOpacity={0.9}
              >
                <Image 
                  source={{uri: (iiif_url + item.image_id + size_url)}} style={[{width: '100%'}, item.thumbnail ? {aspectRatio: item.thumbnail.width / item.thumbnail.height} : {}]} 
                /> 
              </TouchableOpacity>:<></>            
            )}
          />
        </ScrollView>
        {(loading || fetching) ? 
          <View style={styles.loadingView}>
            <ActivityIndicator 
              animating={true}
              color={currentTheme.colors.loadingIndicator}
              style={styles.loadingIndicator}
              size={32}
            />
          </View>
          :
          <></>
        }
        <Modalize
           ref={modalizeRef}
           scrollViewProps={{
             showsVerticalScrollIndicator: false,
           }}
           adjustToContentHeight={true}
          //  handleStyle={{
          //    backgroundColor: currentTheme.colors.primary + '00',
          //    position: 'absolute',
          //    left: 0,
          //    height: 170, 
          //    width: '75%',
          //    zIndex: 100,
          //  }}
           modalStyle={{marginBottom: BOTTOM_TAB_OFFSET}}
          //  HeaderComponent={renderFooter()}
           handlePosition='inside'
           velocity={6800}
           threshold={300}
        >
          {renderContent()}
        </Modalize>
      </SafeAreaView>
    // </SafeAreaView>
  )
  
}

export default SearchScreen

const styles = StyleSheet.create({})