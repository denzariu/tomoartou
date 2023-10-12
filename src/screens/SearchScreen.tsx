import { ActivityIndicator, Animated, Dimensions, FlatList, Image, NativeScrollEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { TextInput } from 'react-native';
import { Modalize } from 'react-native-modalize';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalArtwork from '../components/ModalArtwork';

const SearchScreen = () => {
  
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [changingInput, setChangingInput] = useState<boolean>(false)
  const [searchInput, setSearchInput] = useState<string | undefined>('');

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [artworksData, setArtworksData] = useState<any | undefined>([])
  const [artworks, setArtworks] = useState<any | undefined>([])

  const [modalOpen, setModalOpen] = useState<any>()
  const [currentItem, setCurrentItem] = useState<any>()

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';
  const larger_size_url = '/full/843,/0/default.jpg';
  // const [imageUrl, setImageUrl] = useState<string>('/full/843,/0/default.jpg');

  const LIMIT = 16;
  const OFFSET = 68;
  const BOTTOM_TAB_OFFSET: number = 52 //useBottomTabBarHeight()


  const getArtworks = () => {
      setFetching(true);
      // do fetch requests in parallel
      // using the Promise.all() method
      const promises = artworksData.slice(artworksData.length - 10).map((item: any) => {
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
        setArtworks(artworks.concat(res))
        setFetching(false)
        console.log(artworks)
      })
  }
  
  useEffect(() => {
    if(!changingInput)
      getArtworks()  
  }, [artworksData])

  const searchArtworks = async () => {

    if (searchInput) {
      setLoading(true);
      //https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=2&fields=id,title,image_id
      const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}`
      console.log(url)

      return (
        setFetching(true),
        await fetch(url)
        .then(response => response.json())
        .then(json => {
          // setArtworks(artworks.concat(json.data))
          
          // setArtworksData(artworks.concat(json.data))
          
          setArtworksData(artworksData.concat(json.data))
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
    if (!changingInput)
      searchArtworks()
  }, [currentPage])
  
  useEffect(() => {
    setChangingInput(true)
    setCurrentPage(1)
    setArtworksData([])
    setArtworks([])
    setChangingInput(false)
    searchArtworks()
  }, [searchInput])

  const loadMoreArtworks = () => {
    console.log('pls load more')
    if (!loading && !fetching) { // Also check for list end 
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      console.log('THANKS')
    }
  }
  

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
          placeholderTextColor={currentTheme.colors.foreground}
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
    setModalOpen(true)
  }

  // const handleArtworkClosePress = (item: any) => {
  //   console.log(item.id)
  //   setModalOpen(false)
  // }

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
      paddingVertical: currentTheme.spacing.s,
      backgroundColor: currentTheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    },

    inputContainer: {
      // alignSelf: 'center',
      // paddingVertical: 12,
      backgroundColor: currentTheme.colors.primary,
      width: '100%',
      color: currentTheme.colors.foreground,
      fontWeight: 'bold',
      borderRadius: currentTheme.spacing.s
    },

 

  })

  return (
    // <SafeAreaView style={styles.page}>
      <SafeAreaView style={styles.pageContainer}>
        <SearchHeader/>
        
        <ScrollView 
          onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              loadMoreArtworks();
            }
          }}
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
        <ModalArtwork 
          currentItem={currentItem}
          open={modalOpen}
          OFFSET={BOTTOM_TAB_OFFSET}
          currentTheme={currentTheme}
          setOpen={setModalOpen}
        />
      </SafeAreaView>
    // </SafeAreaView>
  )
  
}

export default SearchScreen

const styles = StyleSheet.create({})