import { ActivityIndicator, Alert, Animated, BackHandler, BackHandlerStatic, DimensionValue, Dimensions, FlatList, Image, LayoutAnimation, NativeEventSubscription, NativeScrollEvent, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native-paper';
// import Animated from 'react-native-reanimated';
import { DarkTheme, Theme } from '../defaults/ui';
// import { TextInput } from 'react-native';
import ModalArtwork from '../components/ModalArtwork';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type categories = 'artworks' | 'artists' | 'places' | undefined | 'artworksPhotographs'
type fetchStatus = 'success' | 'error' | 'unknown' | 'loading' | 'canceled'
const maxPagesLim = 99999999;
const ProximityForLoadingItems = 600;
const LOADING_LIMIT = 20;
const placeholderBobRoss = 'https://pyxis.nymag.com/v1/imgs/2cb/2e1/47a72da70b3f7a301273b06cac9ea615c8-06-bob-ross-painting.rsquare.w400.jpg';
const JSONs = [
  {
    "query": {
        "bool": {
            "must": [{
                    "term": {
                        "classification_titles": "photograph"
                    }
                }
            ]
        }
    }
  },

];
  // const searchForPhotographs = 'https://api.artic.edu/api/v1/artworks/search?q=picasso&page=0&limit=20&fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title&query[term][classification_title]=photograph'


const SearchScreen = () => {

  const controller = new AbortController();
  const [backHandler, setBackHandler] = useState<NativeEventSubscription>();
  
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';

  const [field, setField] = useState<categories>('artworks');
  
  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<fetchStatus>('unknown')
  const [ignoreResult, setIgnoreResult] = useState<boolean>(false)
  const [changingInput, setChangingInput] = useState<boolean>(true)
  const [searchInput, setSearchInput] = useState<string | number | boolean>('');

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [maxPages, setMaxPages] = useState<number>(maxPagesLim)
  const [artworks, setArtworks] = useState<any | undefined>([])
  const [json, setJSON] = useState<any | undefined>(undefined)

  if (searchInput == '' && field != 'artworks' && field != 'places' && field != 'artists')
    setField('artworks')
  
  const [categoriesSpotlight, setCattegoriesSpotlight] = useState<any>([
    {
      title: "Vincent van Gogh", 
      image: iiif_url + '26d3cea8-44c0-bfbd-a91a-19a007517152' + size_url, 
      onPress: () => {}, 
    },
    {
      title: "René Magritte", 
      image: iiif_url + '767f4732-e9f2-3a46-c785-b2ee7109d3aa' + size_url,
      onPress: () => {},
    },
    {
      title: "Japanese",
      image: iiif_url + 'b3974542-b9b4-7568-fc4b-966738f61d78' + size_url,
      onPress: () => {setJSON(JSONs[0]), setField('artworksPhotographs'), setSearchInput('Looking at photographs...')}, 
    },
    {
      title: "Photographs", 
      image: iiif_url + '41f9a984-5c5b-bc7d-09d7-9b6fe0f348c9' + size_url,
      onPress: () => {setJSON(JSONs[0]), setField('artworksPhotographs'), setSearchInput('Looking at photographs...')}, 
    }
  ])

  const parseJSON = (json: any) => {
    setMaxPages(json.pagination.total_pages)
      setFetching('success')

      console.log("This will add: ", json.data.length, " artworks")
      if (json.data.length <= 0) {
        setLoading(false)
        return
      }

      let S1: number = heightRow1
      let S2: number = heightRow2

      json.data = json.data.map( (item: any) => {
        if (item?.thumbnail && item.thumbnail.width && item.thumbnail.height) {
          if (S1 <= S2) {
            item.row = 0
            S1 += item.thumbnail?.height / item.thumbnail?.width
          }
          else {
            item.row = 1
            S2 += item.thumbnail?.height / item.thumbnail?.width
          }
        }
        else item.row = 2

        item.title = item.title.replace('(', "\n(")
        if (item.description)
          item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
        return item
      })

      if (S1 > 50 && S2 > 50)
        S1 -= 50, S2 -= 50

      setHeightRow1(S1)
      setHeightRow2(S2)
      setArtworks(artworks.concat(json.data))
  }


  
  const loadCustomArtworks = (json: any) => {
    const FIELDS = 'id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title,classification_titles'
    const url = `https://api.artic.edu/api/v1/artworks/search/?fields=${FIELDS}&page=${currentPage}&limit=${LOADING_LIMIT/2}`
    
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json),
      signal: controller.signal
    }).then(response => response.json())
    .then(jsonFetched => { console.log(jsonFetched), parseJSON(jsonFetched) })
    .catch(error => {
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const [modalOpen, setModalOpen] = useState<any>()
  const [currentItem, setCurrentItem] = useState<any>()

  const [heightRow1, setHeightRow1] = useState<number>(0)
  const [heightRow2, setHeightRow2] = useState<number>(0)


  const BOTTOM_TAB_OFFSET: number = 0 //useBottomTabBarHeight()

  const loadArtworks = () => {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&limit=${LOADING_LIMIT}&fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title`
      
    console.log("searching for ", searchInput)
    fetch(url, {signal: controller.signal})
    .then(response => response.json())
    .then(json => { parseJSON(json) })
    .catch(error => {
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const loadArtists = () => {
    const url = `https://api.artic.edu/api/v1/agents/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&limit=${LOADING_LIMIT}&fields=id,title,description`
        
    console.log({url:url})
    fetch(url, {signal: controller.signal})
    .then(response => response.json())
    .then(json => {

      setMaxPages(json.pagination.total_pages)
      setFetching('success')

      console.log("This will add: ", json.data.length, " artists")
      if (json.data.length <= 0) {
        setLoading(false)
        return
      }

      json.data = json.data.map( (item: any) => {
        item.title = item.title.replace('(', "\n(")
        if (item.description)
          item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
        return item
      })
      
      setArtworks(artworks.concat(json.data))

    })
    .catch(error => {
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const loadPlaces = () => {
    const url = `https://api.artic.edu/api/v1/places/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&limit=${LOADING_LIMIT}`
    //&fields=id,title,description`
        
    fetch(url, {signal: controller.signal})
    .then(response => response.json())
    .then(json => {

      setMaxPages(json.pagination.total_pages)

      setFetching('success')

      console.log("This will add: ", json.data.length, " places")
      if (json.data.length <= 0) {
        setLoading(false)
        return
      }
      
      json.data = json.data.map( (item: any) => {
        item.title = item.title.replace('(', "\n(")
        if (item.description)
          item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
        return item
      })
      
      setArtworks(artworks.concat(json.data))

    })
    .catch(error => {
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const searchArtworks = () => {
    if (searchInput != '') {
      setFetching('loading')
      setLoading(true)
      
      switch (field) {
        // General search categories
        case 'artworks': 
          loadArtworks()
          break
        case 'artists':
          loadArtists()
          break
        case 'places':
          loadPlaces()
          break
        // Custom search categories
        case 'artworksPhotographs':
          loadCustomArtworks(json)
          break
      }
    }
  }

  useEffect(() => {
    

    // Pop-up exit application
    if (searchInput == '') {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to go exit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      };
  
      setBackHandler(BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      ))
  
    }
    // Erase search input
    else {
      setBackHandler(BackHandler.addEventListener('hardwareBackPress', function () {
        // Abort any ongoing fetch as the result of it is no longer relevant when changing input
        controller.abort();
        setIgnoreResult(true);
        // if (field != 'artworks' && field != 'artists' && field != 'places') {
          setSearchInput('');
          return true;
        // }
        // return false;
      }))
    }
    console.log(fetching)
  }, [searchInput])

  useEffect(() => {
    console.log({ maximum_pages: maxPages, current_page: currentPage, changing_input: changingInput })
    if (!changingInput)
      searchArtworks()
  }, [currentPage])
  
  const loadMoreArtworks = () => {    
    if (!loading && fetching != 'loading' && !changingInput && maxPages > currentPage && searchInput != '') {
      setLoading(true)
      setIgnoreResult(false)
      setCurrentPage((currentValue) => {return (currentValue + 1)});
    }
  }
  
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = ProximityForLoadingItems; // Proximity to bottom, triggering event
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  const handleText = (text: string) => { 
    setSearchInput(text); 
  } 

  useEffect(() => {
    console.log({si: searchInput, fi: field, fetching: fetching})
    if (searchInput == '') {
      setArtworks([])
      return;
    }
  
    setChangingInput(true)
  }, [searchInput, field])

  useEffect(() => {
    if (changingInput) {
      setArtworks(() => [])
      setMaxPages(maxPagesLim)
      setCurrentPage(0)
      setChangingInput(false)
    }
    else 
      loadMoreArtworks()
  }, [changingInput])
  
  const SearchHeader = () => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const inputAnim = useRef(new Animated.Value(100)).current;
    const [animatedSearch, setAnimatedSearch] = useState<Object>({});
    // const animatedWidth = inputAnim.interpolate({inputRange, outputRange});
    const [expanded, setExpanded] = useState<boolean>(true); 

    const fadeIn = () => {
      Animated.timing(inputAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true
      }).start();
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setExpanded(true);
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setAnimatedSearch({width: '100%', backgroundColor: currentTheme.colors.primary});
    };
  
    const fadeOut = () => {
      Animated.timing(inputAnim, {
        toValue: 80,
        duration: 250,
        useNativeDriver: true
    }).start();
      
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setAnimatedSearch({
        width: '80%',
        backgroundColor: currentTheme.colors.background,
        borderColor:  currentTheme.colors.foreground,
        borderWidth: currentTheme.spacing.xs / 4,
        height: 35
      })
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setExpanded(false);
    };

    const headerStyle = StyleSheet.create({
      textHeader: {
        fontFamily: currentTheme.fontFamily.butler_stencil,
        fontSize: currentTheme.fontSize.xxxl
      },
      searchContainer: {
        width: '100%',
        paddingVertical: currentTheme.spacing.s,
        backgroundColor: currentTheme.colors.background,
        zIndex: 100
      },

      inputContainer: {
        backgroundColor: currentTheme.colors.primary,
        width: '100%',
        // color: currentTheme.colors.foreground,
        fontSize: currentTheme.fontSize.m,
        height: 50,
        fontWeight: 'bold',
        borderRadius: currentTheme.spacing.s / 2,
        paddingHorizontal: currentTheme.spacing.m,
      },

      cancelInput: {
        width: '100%',
        color: currentTheme.colors.foreground,
        fontSize: currentTheme.fontSize.m,
        flex: 1,
        fontWeight: '500',
        borderRadius: currentTheme.spacing.s / 2,
        paddingHorizontal: currentTheme.spacing.m,
      },

      searchCategory: {
        backgroundColor: currentTheme.colors.primary,
        paddingHorizontal: currentTheme.spacing.m,
        paddingVertical: currentTheme.spacing.s,
        borderRadius: currentTheme.spacing.s,
        marginTop: currentTheme.spacing.s,
        opacity: 0.5
      },

      searchCategoryS: {
        backgroundColor: currentTheme.colors.primary,
        paddingHorizontal: currentTheme.spacing.s,
        paddingVertical: currentTheme.spacing.xs / 2,
        borderRadius: currentTheme.spacing.s,
        marginVertical: currentTheme.spacing.s,
        marginLeft: currentTheme.spacing.m,
        alignContent: 'center',
        justifyContent: 'center',
        opacity: 0.5
      },
  
      highlightCategory: {
        borderWidth: 1,
        borderColor: currentTheme.colors.foreground,
        paddingHorizontal: currentTheme.spacing.m - 1,
        paddingVertical: currentTheme.spacing.s - 1,
        opacity: 1
      },
  
      searchCategoryText: {
        fontWeight: '500',
        fontSize: currentTheme.fontSize.xs
      },

    })

    return (
      <>
        {expanded &&
          <View style={{flexDirection: 'row'}}>
            <Animated.Text 
              style={[headerStyle.textHeader, {opacity: fadeAnim}]}>Search</Animated.Text>
            
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flex: 1}}>
              <TouchableOpacity 
                style={[headerStyle.searchCategoryS, field == 'artworks' ? headerStyle.highlightCategory : {}]}
                onPress={() => setField('artworks')}
              >
                <Text style={headerStyle.searchCategoryText}>Artworks</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[headerStyle.searchCategoryS, field == 'artists' ? headerStyle.highlightCategory : {}]}
                onPress={() => setField('artists')}
              >
                <Text style={headerStyle.searchCategoryText}>Agents</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[headerStyle.searchCategoryS, field == 'places' ? headerStyle.highlightCategory : {}]}
                onPress={() => setField('places')}
              >
                <Text style={headerStyle.searchCategoryText}>Places</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        }
        <View style={headerStyle.searchContainer}>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              left={<TextInput.Icon disabled={true} icon="card-search-outline" color={currentTheme.colors.foreground} />}
              onFocus={() => {
                fadeOut(); 
              }}
              onBlur={() => {
                fadeIn();
              }}
              style={[headerStyle.inputContainer, animatedSearch]}
              textAlign='left'
              textAlignVertical='center'
              placeholder={(field == 'artworks' || field == 'artists' || field == 'places') ? `Search for ${field}...` : 'What are you interested in?'}
              inputMode='text'
              maxLength={100}
              selectTextOnFocus={true}
              // placeholderTextColor={currentTheme.colors.foreground}
              selectionColor={currentTheme.colors.primary}
              cursorColor={currentTheme.colors.foreground}
              defaultValue={String(searchInput)}
              onSubmitEditing={(text) => {handleText(text.nativeEvent.text), fadeIn(), Keyboard.dismiss()}}
            >
            </TextInput>
            {!expanded &&
              <TouchableOpacity 
                // style={[headerStyle.searchCategory, field == 'artworks' ? headerStyle.highlightCategory : {}]}
                onPress={() => {fadeIn(), Keyboard.dismiss()}}
              >
                <Animated.Text style={[headerStyle.cancelInput, {justifyContent: 'center', textAlignVertical: 'center', opacity: fadeAnim}]}>Cancel</Animated.Text>
              </TouchableOpacity>
            }
          </View>
          {!expanded &&
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '80%'}}>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'artworks' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('artworks')}
            >
              <Text style={headerStyle.searchCategoryText}>Artworks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'artists' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('artists')}
            >
              <Text style={headerStyle.searchCategoryText}>Agents</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'places' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('places')}
            >
              <Text style={headerStyle.searchCategoryText}>Places</Text>
            </TouchableOpacity>
          </View>
          }
        </View>
      </>
    )
  }

  const handleArtworkOpenPress = (item: any) => {
    setCurrentItem(item)
    setModalOpen(true)
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.page
    },

    pageContainer: {
      flex: 1,
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

    textNoMoreArtworks: {
      fontSize: currentTheme.fontSize.xl,
      fontFamily: currentTheme.fontFamily.butler_bold,
      textAlignVertical: 'center',
      textAlign: 'center'
    },

    rotate90: {
      transform: [{ rotate: '90deg' }]
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
        paddingBottom: 10,
    },

    gradient: {
      bottom: currentTheme.spacing.xl + currentTheme.spacing.l, // + paddingTop
      marginBottom: -currentTheme.spacing.xl + currentTheme.spacing.l, // same as above
      paddingTop: currentTheme.spacing.l,
    },

    artistTouchable: {
      width: '100%', 
      aspectRatio: 0.91, 
      borderTopLeftRadius: currentTheme.spacing.s, 
      borderTopRightRadius: currentTheme.spacing.s
    },

    artistText: {
      position: 'relative',
      paddingHorizontal: currentTheme.spacing.s,
      paddingVertical: currentTheme.spacing.s,
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.m,
      // fontWeight: '500',
      fontFamily: currentTheme.fontFamily.butler,
      // borderColor: currentTheme.colors.background,
      // borderWidth: 2,
      // borderTopWidth: 2,
      // background: 'linear-gradient(90deg, rgba(9,9,121,1) 0%, rgba(0,212,255,1) 100%)'
      // backgroundColor: (currentTheme.colors.primary).concat('cc')
    }
  })

  const Artwork = (item: any, row: number) => {
    return (
      (item?.row % 2 == row) ?
      <TouchableOpacity 
        style={styles.artworkTouchable} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: (iiif_url + item?.image_id + size_url)}} style={[{width: '100%'}, (item?.thumbnail && item?.thumbnail.width && item?.thumbnail.height) ? {aspectRatio: item?.thumbnail?.width / item?.thumbnail?.height} : {}]} 
        /> 
      </TouchableOpacity>:<></>
    )
  }

  const Artist = (item: any, index: number, row: number) => {
    return (
      (index % 2 == row) ?
      <TouchableOpacity 
        style={[styles.artworkTouchable, {marginBottom: -currentTheme.spacing.xxl, padding: currentTheme.spacing.xs}]} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: 'https://pyxis.nymag.com/v1/imgs/2cb/2e1/47a72da70b3f7a301273b06cac9ea615c8-06-bob-ross-painting.rsquare.w400.jpg'}} 
          style={styles.artistTouchable} 
        /> 
        <LinearGradient
          style={styles.gradient}
          colors={[currentTheme.colors.background+'00', currentTheme.colors.background]}
        >
          <Text
            numberOfLines={1}
            style={styles.artistText}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>:<></>
    )
  }

  const Place = (item: any, index: number, row: number) => {
    return (
      (index % 2 == row) ?
      <TouchableOpacity 
        style={[styles.artworkTouchable, {marginBottom: -currentTheme.spacing.xxl, padding: currentTheme.spacing.xs}]} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: placeholderBobRoss}} 
          style={styles.artistTouchable} 
        /> 
        <LinearGradient
          style={styles.gradient}
          colors={[currentTheme.colors.background+'00', currentTheme.colors.background]}
        >
          <Text 
            numberOfLines={1}
            style={styles.artistText}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>:<></>
    )
  }

  const PredefinedCategory = (item: any, index: number) => {
    return (
      <TouchableOpacity 
        style={[{marginBottom: -currentTheme.spacing.xxl, padding: currentTheme.spacing.xs, flex: 1}]} 
        onPress={item.onPress}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: item.image ? item.image : placeholderBobRoss}} 
          style={styles.artistTouchable} 
        /> 
        <LinearGradient
          style={styles.gradient}
          colors={[currentTheme.colors.background+'00', currentTheme.colors.background]}
        >
          <Text
            numberOfLines={1}
            style={styles.artistText}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    // <SafeAreaView style={styles.page}>
      <SafeAreaView style={styles.pageContainer}>
        <SearchHeader/>
        
        {!ignoreResult && 
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
            keyExtractor={(item, index) => 1 + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
                (field == 'artworks' || field == 'artworksPhotographs') ? Artwork(item, 0) :
                field == 'artists' ? Artist(item, index, 0) : 
                field == 'places' ? Place(item, index, 0) : <></> 
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
              (field == 'artworks' || field == 'artworksPhotographs') ? Artwork(item, 1) :
              field == 'artists' ? Artist(item, index, 1) : 
              field == 'places' ? Place(item, index, 1) : <></> 
            
            )}
          />
        </ScrollView>
        }

        {(searchInput == '') ? 
          <FlatList
            removeClippedSubviews={true}
            keyExtractor={(item, index) => 3 + index.toString()}
            scrollEnabled={true}
            data={categoriesSpotlight}
            numColumns={2}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              PredefinedCategory(item, index)
            )}
          />
          :
          <></>
        }

        {(loading || fetching == 'loading') ? 
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
        
        
        {(maxPages <= currentPage && maxPages != maxPagesLim) ? 
          <View style={{flex: 1}}>
            <Text style={styles.textNoMoreArtworks}>You've reached the end</Text>
            <Text style={[styles.textNoMoreArtworks, styles.rotate90]}>:)</Text>
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